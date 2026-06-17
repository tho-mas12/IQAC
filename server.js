const express = require('express');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from the current directory
app.use(express.static(__dirname));

// Block sensitive backend files from direct browser access
app.use((req, res, next) => {
  const file = req.url.toLowerCase();
  if (file.includes('database.sqlite') || file.includes('server.js') || file.includes('package.json') || file.includes('node_modules')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Database Driver Switch (PostgreSQL / SQLite)
const usePostgres = !!process.env.DATABASE_URL;
let pgClient = null;
let sqliteDb = null;

if (usePostgres) {
  const { Client } = require('pg');
  pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  pgClient.connect((err) => {
    if (err) {
      console.error('Error connecting to Supabase PostgreSQL database:', err.stack);
    } else {
      console.log('Connected to Supabase PostgreSQL database.');
      initializeDatabase();
    }
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbDir = process.env.DATA_DIR || __dirname;
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (mkdirErr) {
      console.error('Error creating database directory:', mkdirErr.message);
    }
  }
  const dbPath = path.join(dbDir, 'database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
      initializeDatabase();
    }
  });
}

// Convert SQLite "?" placeholders to PostgreSQL "$1, $2"
function convertSqlParams(sql) {
  if (!usePostgres) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

function dbRun(sql, params = [], callback = () => {}) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  const querySql = convertSqlParams(sql);
  if (usePostgres) {
    pgClient.query(querySql, params, (err, res) => {
      if (err) return callback(err);
      const ctx = {
        lastID: res.rows && res.rows[0] ? res.rows[0].id : null,
        changes: res.rowCount
      };
      callback.call(ctx, null);
    });
  } else {
    sqliteDb.run(sql, params, function(err) {
      callback.call(this, err);
    });
  }
}

function dbGet(sql, params = [], callback = () => {}) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  const querySql = convertSqlParams(sql);
  if (usePostgres) {
    pgClient.query(querySql, params, (err, res) => {
      if (err) return callback(err, null);
      callback(null, res.rows[0] || null);
    });
  } else {
    sqliteDb.get(sql, params, (err, row) => {
      callback(err, row);
    });
  }
}

function dbAll(sql, params = [], callback = () => {}) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  const querySql = convertSqlParams(sql);
  if (usePostgres) {
    pgClient.query(querySql, params, (err, res) => {
      if (err) return callback(err, null);
      callback(null, res.rows || []);
    });
  } else {
    sqliteDb.all(sql, params, (err, rows) => {
      callback(err, rows);
    });
  }
}

const db = {
  get: dbGet,
  all: dbAll,
  run: dbRun
};

// Dialect-compatible Schema Creation
function createTables(dbRunExecutor, callback) {
  const usersSql = usePostgres 
    ? `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      )`
    : `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL
      )`;

  const deptsSql = `CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    shift VARCHAR(100) NOT NULL
  )`;

  const eventsSql = `CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    deadline VARCHAR(255) NOT NULL
  )`;

  const submissionsSql = usePostgres
    ? `CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        department_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        received_time VARCHAR(255),
        remarks TEXT,
        UNIQUE(event_id, department_id),
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
      )`
    : `CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        status TEXT NOT NULL,
        received_time TEXT,
        remarks TEXT,
        UNIQUE(event_id, department_id),
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
      )`;

  dbRunExecutor(usersSql, [], () => {
    dbRunExecutor(deptsSql, [], () => {
      dbRunExecutor(eventsSql, [], () => {
        dbRunExecutor(submissionsSql, [], () => {
          callback();
        });
      });
    });
  });
}

// Cascading Seed Data Initialization
function initializeDatabase() {
  createTables(db.run, () => {
    // 1. Seed users
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (row && (row.count === 0 || row.count === '0')) {
        db.run("INSERT INTO users (username, password, name, role) VALUES ('staff', 'staff123', 'IQAC Coordinator', 'Staff')", [], () => {
          db.run("INSERT INTO users (username, password, name, role) VALUES ('director', 'director123', 'Dr. Sarah Joseph (Director)', 'Director')", [], () => {
            console.log('Default users seeded.');
            seedDepartments();
          });
        });
      } else {
        seedDepartments();
      }
    });
  });
}

function seedDepartments() {
  db.get("SELECT COUNT(*) as count FROM departments", (err, row) => {
    if (row && (row.count === 0 || row.count === '0')) {
      const initialDepts = [
        // Shift 1 - Science
        { id: "s1-sci-botany", name: "Botany", category: "Science", shift: "Shift 1" },
        { id: "s1-sci-chemistry", name: "Chemistry", category: "Science", shift: "Shift 1" },
        { id: "s1-sci-cs", name: "Computer Science", category: "Science", shift: "Shift 1" },
        { id: "s1-sci-maths", name: "Mathematics", category: "Science", shift: "Shift 1" },
        { id: "s1-sci-physics", name: "Physics", category: "Science", shift: "Shift 1" },
        { id: "s1-sci-stats", name: "Statistics", category: "Science", shift: "Shift 1" },
        // Shift 1 - Arts
        { id: "s1-arts-eco", name: "Economics", category: "Arts", shift: "Shift 1" },
        { id: "s1-arts-eng", name: "English Literature", category: "Arts", shift: "Shift 1" },
        { id: "s1-arts-hist", name: "History", category: "Arts", shift: "Shift 1" },
        { id: "s1-arts-tam", name: "Tamil Literature", category: "Arts", shift: "Shift 1" },
        // Shift 1 - Commerce
        { id: "s1-comm-comm", name: "Commerce", category: "Commerce", shift: "Shift 1" },
        // Shift 1 - Vocational
        { id: "s1-voc-sdsa", name: "Software Development & System Administration", category: "Vocational", shift: "Shift 1" },
        { id: "s1-voc-vct", name: "Visual Communication Technology", category: "Vocational", shift: "Shift 1" },
        // Shift 1 - Postgraduate
        { id: "s1-pg-botany", name: "M.Sc. Botany", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-chemistry", name: "M.Sc. Chemistry", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-mcom", name: "M.Com.", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-eco", name: "M.A. Economics", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-eng", name: "M.A. English", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-hrm", name: "M.A. HRM", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-maths", name: "M.Sc. Mathematics", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-physics", name: "M.Sc. Physics", category: "Postgraduate", shift: "Shift 1" },
        { id: "s1-pg-mca", name: "MCA", category: "Postgraduate", shift: "Shift 1" },

        // Shift 2 - Computer & Data Sciences
        { id: "s2-cds-aiml", name: "AI & Machine Learning", category: "Computer & Data Sciences", shift: "Shift 2" },
        { id: "s2-cds-bca", name: "Computer Applications (BCA)", category: "Computer & Data Sciences", shift: "Shift 2" },
        { id: "s2-cds-cs", name: "Computer Science", category: "Computer & Data Sciences", shift: "Shift 2" },
        // Shift 2 - Commerce & Management
        { id: "s2-cm-bba", name: "BBA", category: "Commerce & Management", shift: "Shift 2" },
        { id: "s2-cm-comm", name: "Commerce", category: "Commerce & Management", shift: "Shift 2" },
        { id: "s2-cm-cca", name: "Commerce CA", category: "Commerce & Management", shift: "Shift 2" },
        { id: "s2-cm-ba", name: "Business Analytics", category: "Commerce & Management", shift: "Shift 2" },
        { id: "s2-cm-sf", name: "Strategic Finance", category: "Commerce & Management", shift: "Shift 2" },
        { id: "s2-cm-ch", name: "Commerce Honours", category: "Commerce & Management", shift: "Shift 2" },
        // Shift 2 - Applied Sciences
        { id: "s2-as-biotech", name: "Biotechnology", category: "Applied Sciences", shift: "Shift 2" },
        { id: "s2-as-biochem", name: "Biochemistry", category: "Applied Sciences", shift: "Shift 2" },
        { id: "s2-as-elec", name: "Electronics", category: "Applied Sciences", shift: "Shift 2" },
        { id: "s2-as-maths", name: "Mathematics", category: "Applied Sciences", shift: "Shift 2" },
        { id: "s2-as-physics", name: "Physics", category: "Applied Sciences", shift: "Shift 2" },
        { id: "s2-as-stats", name: "Statistics", category: "Applied Sciences", shift: "Shift 2" },
        // Shift 2 - Humanities
        { id: "s2-hum-eng", name: "English", category: "Humanities", shift: "Shift 2" },
        { id: "s2-hum-hist", name: "History", category: "Humanities", shift: "Shift 2" },
        { id: "s2-hum-tam", name: "Tamil", category: "Humanities", shift: "Shift 2" },
        { id: "s2-hum-hrm", name: "HRM", category: "Humanities", shift: "Shift 2" },
        { id: "s2-hum-cp", name: "Counselling Psychology", category: "Humanities", shift: "Shift 2" },
        // Shift 2 - Media
        { id: "s2-media-viscom", name: "Visual Communication", category: "Media", shift: "Shift 2" },
        // Shift 2 - Physical Education
        { id: "s2-pe-pe", name: "Physical Education", category: "Physical Education", shift: "Shift 2" },

        // Administrative Units
        { id: "admin-iqac", name: "IQAC Office", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-principal", name: "Principal Office", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-coe", name: "Controller of Examinations", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-library", name: "Library", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-placement", name: "Placement Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-research", name: "Research Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-nss", name: "NSS", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-ncc", name: "NCC", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-yrc", name: "YRC", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-rrc", name: "RRC", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-sports", name: "Sports Department", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-hostel", name: "Hostel", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-alumni", name: "Alumni Association", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-wec", name: "Women Empowerment Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-cgc", name: "Career Guidance Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-edc", name: "Entrepreneurship Development Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-icc", name: "Internal Complaints Committee", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-antirag", name: "Anti-Ragging Cell", category: "Administrative Units", shift: "Administrative Units" },
        { id: "admin-discipline", name: "Discipline Committee", category: "Administrative Units", shift: "Administrative Units" }
      ];

      if (usePostgres) {
        let sql = "INSERT INTO departments (id, name, category, shift) VALUES ";
        const values = [];
        let index = 1;
        initialDepts.forEach((d, i) => {
          sql += `($${index++}, $${index++}, $${index++}, $${index++})${i === initialDepts.length - 1 ? '' : ', '}`;
          values.push(d.id, d.name, d.category, d.shift);
        });
        db.run(sql, values, (err) => {
          if (err) console.error("Error seeding departments:", err.message);
          else console.log('Default departments seeded.');
          seedEvents();
        });
      } else {
        let insertCount = 0;
        initialDepts.forEach(d => {
          db.run("INSERT INTO departments (id, name, category, shift) VALUES (?, ?, ?, ?)", [d.id, d.name, d.category, d.shift], (err) => {
            insertCount++;
            if (insertCount === initialDepts.length) {
              console.log('Default departments seeded.');
              seedEvents();
            }
          });
        });
      }
    } else {
      seedEvents();
    }
  });
}

function seedEvents() {
  db.get("SELECT COUNT(*) as count FROM events", (err, row) => {
    if (row && (row.count === 0 || row.count === '0')) {
      const activeDeadline = new Date();
      activeDeadline.setDate(activeDeadline.getDate() + 3);

      const passedDeadline = new Date();
      passedDeadline.setDate(passedDeadline.getDate() - 2);

      db.run("INSERT INTO events (id, title, description, created_at, deadline) VALUES (?, ?, ?, ?, ?)", [
        "evt-aqar-2026",
        "AQAR Criteria-wise Report Collection (2025-26)",
        "Submit all quantitative templates and narrative descriptions for Criteria 1 to 7.",
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        activeDeadline.toISOString()
      ], () => {
        db.run("INSERT INTO events (id, title, description, created_at, deadline) VALUES (?, ?, ?, ?, ?)", [
          "evt-nirf-2026",
          "NIRF Publications & Placement Data Collection",
          "Submit verified reports on student placements, higher studies, and faculty publication indexes.",
          new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          passedDeadline.toISOString()
        ], () => {
          console.log('Default events seeded.');
          seedSubmissions();
        });
      });
    } else {
      seedSubmissions();
    }
  });
}

function seedSubmissions() {
  db.get("SELECT COUNT(*) as count FROM submissions", (err, row) => {
    if (row && (row.count === 0 || row.count === '0')) {
      db.run("INSERT INTO submissions (event_id, department_id, status, received_time) VALUES ('evt-aqar-2026', 's1-sci-botany', 'received', ?)", [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()], () => {
        db.run("INSERT INTO submissions (event_id, department_id, status, remarks) VALUES ('evt-aqar-2026', 's1-sci-cs', 'remarks', 'Missing Student feedback excel data. Please upload.')", [], () => {
          db.run("INSERT INTO submissions (event_id, department_id, status, received_time) VALUES ('evt-nirf-2026', 's1-sci-chemistry', 'received', ?)", [new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()], () => {
            db.run("INSERT INTO submissions (event_id, department_id, status, received_time) VALUES ('evt-nirf-2026', 's1-sci-physics', 'received', ?)", [new Date().toISOString()], () => {
              console.log('Default submissions seeded.');
            });
          });
        });
      });
    }
  });
}

// ================= API ENDPOINTS =================

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (user) {
      res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

// 2. User Management (Director Access)
app.get('/api/users', (req, res) => {
  db.all("SELECT id, username, name, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.run("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", [username, password, name, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, username, name, role });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { username, password, name, role } = req.body;
  const userId = req.params.id;

  if (password) {
    // If updating password
    db.run("UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE id = ?", [username, password, name, role, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User updated successfully' });
    });
  } else {
    // Without password update
    db.run("UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?", [username, name, role, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User updated successfully' });
    });
  }
});

app.delete('/api/users/:id', (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

// 3. Department Management (Staff Access)
app.get('/api/departments', (req, res) => {
  db.all("SELECT * FROM departments ORDER BY category, name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/departments', (req, res) => {
  const { name, category, shift } = req.body;
  if (!name || !category || !shift) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Generate code-friendly ID
  const id = `${shift === 'Shift 1' ? 's1' : shift === 'Shift 2' ? 's2' : 'admin'}-${category.toLowerCase().substring(0,3)}-${name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0,10)}`;

  db.run("INSERT INTO departments (id, name, category, shift) VALUES (?, ?, ?, ?)", [id, name, category, shift], function(err) {
    if (err) return res.status(500).json({ error: 'Department ID already exists or invalid data' });
    res.status(201).json({ id, name, category, shift });
  });
});

app.put('/api/departments/:id', (req, res) => {
  const { name, category, shift } = req.body;
  db.run("UPDATE departments SET name = ?, category = ?, shift = ? WHERE id = ?", [name, category, shift, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department updated successfully' });
  });
});

app.delete('/api/departments/:id', (req, res) => {
  db.run("DELETE FROM departments WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Department deleted successfully' });
  });
});

// 4. Event Management (Staff Access)
app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', (req, res) => {
  const { title, description, deadline } = req.body;
  const id = 'evt-' + Date.now();
  const created_at = new Date().toISOString();

  db.run("INSERT INTO events (id, title, description, created_at, deadline) VALUES (?, ?, ?, ?, ?)", [id, title, description, created_at, deadline], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, title, description, created_at, deadline });
  });
});

app.delete('/api/events/:id', (req, res) => {
  // First delete associated submissions cascade style
  db.serialize(() => {
    db.run("DELETE FROM submissions WHERE event_id = ?", [req.params.id]);
    db.run("DELETE FROM events WHERE id = ?", [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Event deleted successfully' });
    });
  });
});

// 5. Checklist Checklist Submissions Status (Direct left join of departments and submissions)
app.get('/api/submissions/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const query = `
    SELECT d.id as dept_id, d.name, d.category, d.shift, s.status, s.received_time, s.remarks
    FROM departments d
    LEFT JOIN submissions s ON d.id = s.department_id AND s.event_id = ?
    ORDER BY d.category, d.name
  `;
  db.all(query, [eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Map null submissions to pending structure
    const checklists = {};
    rows.forEach(row => {
      checklists[row.dept_id] = {
        status: row.status || 'pending',
        receivedTime: row.received_time || null,
        remarks: row.remarks || null
      };
    });
    res.json(checklists);
  });
});

app.post('/api/submissions', (req, res) => {
  const { event_id, department_id, status, received_time, remarks } = req.body;
  
  const query = `
    INSERT INTO submissions (event_id, department_id, status, received_time, remarks)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(event_id, department_id) DO UPDATE SET
      status = excluded.status,
      received_time = excluded.received_time,
      remarks = excluded.remarks
  `;
  db.run(query, [event_id, department_id, status, received_time, remarks], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Submission status saved successfully' });
  });
});

// Serve frontend SPA for any fallback routing (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`IQAC Portal Server is running at http://localhost:${PORT}`);
});
