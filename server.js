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

// Serve index.html for public status URL path
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
  let querySql = convertSqlParams(sql);
  if (usePostgres) {
    if (querySql.trim().toUpperCase().startsWith('INSERT ')) {
      querySql += ' RETURNING id';
    }
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
    deadline VARCHAR(255) NOT NULL,
    shifts_scope TEXT DEFAULT 'Shift 1,Shift 2,Combined Department',
    is_visible_public INTEGER DEFAULT 1
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

  const invCategoriesSql = `CREATE TABLE IF NOT EXISTS staff_involvement_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    coordinator VARCHAR(255),
    shift VARCHAR(100)
  )`;

  const invRecordsSql = usePostgres
    ? `CREATE TABLE IF NOT EXISTS staff_involvement_records (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(255) NOT NULL,
        section_type VARCHAR(50) NOT NULL,
        col1 TEXT,
        col2 TEXT,
        col3 TEXT,
        col4 TEXT,
        col5 TEXT,
        col6 TEXT,
        col7 TEXT,
        col8 TEXT,
        FOREIGN KEY (category_id) REFERENCES staff_involvement_categories (id) ON DELETE CASCADE
      )`
    : `CREATE TABLE IF NOT EXISTS staff_involvement_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        section_type TEXT NOT NULL,
        col1 TEXT,
        col2 TEXT,
        col3 TEXT,
        col4 TEXT,
        col5 TEXT,
        col6 TEXT,
        col7 TEXT,
        col8 TEXT,
        FOREIGN KEY (category_id) REFERENCES staff_involvement_categories (id) ON DELETE CASCADE
      )`;

  const ewylStudentsSql = usePostgres
    ? `CREATE TABLE IF NOT EXISTS ewyl_students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        reg_no VARCHAR(255) UNIQUE NOT NULL,
        dept_name VARCHAR(255) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_no VARCHAR(255) NOT NULL,
        ifsc_code VARCHAR(255) NOT NULL,
        branch_name VARCHAR(255) NOT NULL
      )`
    : `CREATE TABLE IF NOT EXISTS ewyl_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_no TEXT UNIQUE NOT NULL,
        dept_name TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        account_no TEXT NOT NULL,
        ifsc_code TEXT NOT NULL,
        branch_name TEXT NOT NULL
      )`;

  const ewylHoursSql = usePostgres
    ? `CREATE TABLE IF NOT EXISTS ewyl_hours (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        date VARCHAR(50) NOT NULL,
        in_time VARCHAR(50) NOT NULL,
        out_time VARCHAR(50) NOT NULL,
        total_hours NUMERIC(5,2) NOT NULL,
        month_active VARCHAR(50) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES ewyl_students (id) ON DELETE CASCADE
      )`
    : `CREATE TABLE IF NOT EXISTS ewyl_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        in_time TEXT NOT NULL,
        out_time TEXT NOT NULL,
        total_hours REAL NOT NULL,
        month_active TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES ewyl_students (id) ON DELETE CASCADE
      )`;

  dbRunExecutor(usersSql, [], () => {
    dbRunExecutor(deptsSql, [], () => {
      dbRunExecutor(eventsSql, [], () => {
        dbRunExecutor(submissionsSql, [], () => {
          dbRunExecutor(invCategoriesSql, [], () => {
            dbRunExecutor(invRecordsSql, [], () => {
              dbRunExecutor(ewylStudentsSql, [], () => {
                dbRunExecutor(ewylHoursSql, [], () => {
                  callback();
                });
              });
            });
          });
        });
      });
    });
  });
}

// Cascading Seed Data Initialization
function initializeDatabase() {
  const addCol = (table, col, type, defVal) => {
    let sql = `ALTER TABLE ${table} ADD COLUMN `;
    if (usePostgres) sql += "IF NOT EXISTS ";
    sql += `${col} ${type}`;
    if (defVal !== undefined) sql += ` DEFAULT ${defVal}`;
    return sql;
  };

  createTables(db.run, () => {
    if (usePostgres) {
      db.run("ALTER TABLE events ALTER COLUMN shifts_scope TYPE TEXT", [], (err) => {
        if (err) console.error("Error migrating shifts_scope to TEXT:", err.message);
      });

      // Enable Row-Level Security (RLS) on all tables to prevent public REST API exposure
      const secureTables = [
        'users',
        'departments',
        'events',
        'submissions',
        'staff_involvement_categories',
        'staff_involvement_records',
        'ewyl_students',
        'ewyl_hours'
      ];
      secureTables.forEach(table => {
        db.run(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, [], (err) => {
          if (err) {
            console.error(`Error enabling RLS on ${table}:`, err.message);
          } else {
            console.log(`Row-Level Security automatically enabled on: ${table}`);
          }
        });
      });
    }
    // Migration: Update existing data from 'Administrative Units' to 'Combined Department'
    db.run("UPDATE departments SET shift = 'Combined Department' WHERE shift = 'Administrative Units'", [], () => {
      db.run("UPDATE departments SET category = 'Combined Department' WHERE category = 'Administrative Units'", [], () => {
        db.run("UPDATE events SET shifts_scope = REPLACE(shifts_scope, 'Administrative Units', 'Combined Department')", [], () => {
          // Migration: Add columns to tables
          db.run(addCol('events', 'shifts_scope', 'TEXT', "'Shift 1,Shift 2,Combined Department'"), [], (err) => {
            db.run(addCol('events', 'is_visible_public', 'INTEGER', 1), [], (err2) => {
              db.run(addCol('staff_involvement_categories', 'department', 'VARCHAR(255)'), [], () => {
                db.run(addCol('staff_involvement_categories', 'coordinator', 'VARCHAR(255)'), [], () => {
                  db.run(addCol('staff_involvement_categories', 'shift', 'VARCHAR(100)'), [], () => {
                    db.run(addCol('staff_involvement_records', 'section_type', 'VARCHAR(50)'), [], () => {
                      db.run(addCol('staff_involvement_records', 'col1', 'TEXT'), [], () => {
                        db.run(addCol('staff_involvement_records', 'col2', 'TEXT'), [], () => {
                          db.run(addCol('staff_involvement_records', 'col3', 'TEXT'), [], () => {
                            db.run(addCol('staff_involvement_records', 'col4', 'TEXT'), [], () => {
                              db.run(addCol('staff_involvement_records', 'col5', 'TEXT'), [], () => {
                                db.run(addCol('staff_involvement_records', 'col6', 'TEXT'), [], () => {
                                  db.run(addCol('staff_involvement_records', 'col7', 'TEXT'), [], () => {
                                    db.run(addCol('staff_involvement_records', 'col8', 'TEXT'), [], () => {
                                      db.run(addCol('staff_involvement_records', 'status', "VARCHAR(50)", "'Pending'"), [], () => {
                                        db.run(addCol('staff_involvement_records', 'remark', "TEXT", "''"), [], () => {
                                          // Clean up null/empty department & shift values from category names, and standardize shift values
                                          db.all("SELECT id, name, department, shift FROM staff_involvement_categories", [], (err, rows) => {
                                            if (rows) {
                                              rows.forEach(row => {
                                                let updateNeeded = false;
                                                let dept = row.department;
                                                let shift = row.shift;
                                                
                                                // Standardize existing shift values in DB
                                                if (shift === 'Shift I' || shift === 'Shift II') {
                                                  shift = (shift === 'Shift I') ? 'Shift 1' : 'Shift 2';
                                                  updateNeeded = true;
                                                }
                                                
                                                if (!dept || !shift) {
                                                  const match = row.name.match(/^(.*?)\s*\((Shift 1|Shift 2|Combined Department|Shift I|Shift II)\)/i);
                                                  if (match) {
                                                    if (!dept) {
                                                      dept = match[1].trim();
                                                      updateNeeded = true;
                                                    }
                                                    if (!shift) {
                                                      let shiftVal = match[2].trim();
                                                      if (shiftVal === 'Shift I') shift = 'Shift 1';
                                                      else if (shiftVal === 'Shift II') shift = 'Shift 2';
                                                      else shift = shiftVal;
                                                      updateNeeded = true;
                                                    }
                                                  }
                                                }
                                                if (updateNeeded) {
                                                  db.run("UPDATE staff_involvement_categories SET department = ?, shift = ? WHERE id = ?", [dept, shift, row.id]);
                                                }
                                              });
                                            }
                                          });
                                          
                                          // 1. Seed users individually if missing
                                          const seedUser = (username, password, name, role, callback) => {
                                            db.get("SELECT COUNT(*) as count FROM users WHERE username = ?", [username], (err, row) => {
                                              if (row && (row.count === 0 || row.count === '0' || row.count === 0)) {
                                                db.run("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)", [username, password, name, role], () => {
                                                  if (callback) callback();
                                                });
                                              } else {
                                                if (callback) callback();
                                              }
                                            });
                                          };
                                          
                                          seedUser('staff', 'staff123', 'IQAC Coordinator', 'Staff', () => {
                                            seedUser('director', 'director123', 'Dr. Sarah Joseph (Director)', 'Director', () => {
                                              seedUser('user', 'user123', 'Department User', 'User', () => {
                                                console.log('Default users checked and seeded if missing.');
                                                seedDepartments();
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
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

        // Combined Department
        { id: "admin-iqac", name: "IQAC Office", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-principal", name: "Principal Office", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-coe", name: "Controller of Examinations", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-library", name: "Library", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-placement", name: "Placement Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-research", name: "Research Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-nss", name: "NSS", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-ncc", name: "NCC", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-yrc", name: "YRC", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-rrc", name: "RRC", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-sports", name: "Sports Department", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-hostel", name: "Hostel", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-alumni", name: "Alumni Association", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-wec", name: "Women Empowerment Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-cgc", name: "Career Guidance Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-edc", name: "Entrepreneurship Development Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-icc", name: "Internal Complaints Committee", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-antirag", name: "Anti-Ragging Cell", category: "Combined Department", shift: "Combined Department" },
        { id: "admin-discipline", name: "Discipline Committee", category: "Combined Department", shift: "Combined Department" }
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
          if (process.env.SEED_DUMMY_DATA === 'true') {
            seedEvents();
          }
        });
      } else {
        let insertCount = 0;
        initialDepts.forEach(d => {
          db.run("INSERT INTO departments (id, name, category, shift) VALUES (?, ?, ?, ?)", [d.id, d.name, d.category, d.shift], (err) => {
            insertCount++;
            if (insertCount === initialDepts.length) {
              console.log('Default departments seeded.');
              if (process.env.SEED_DUMMY_DATA === 'true') {
                seedEvents();
              }
            }
          });
        });
      }
    } else {
      if (process.env.SEED_DUMMY_DATA === 'true') {
        seedEvents();
      }
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
              seedInvolvementData();
            });
          });
        });
      });
    } else {
      seedInvolvementData();
    }
  });
}

function seedInvolvementData() {
  db.get("SELECT COUNT(*) as count FROM staff_involvement_categories WHERE id = 'dept_action_plan_2026_2027'", (err, row) => {
    if (row && (row.count === 0 || row.count === '0')) {
      const catId = "dept_action_plan_2026_2027";
      const catName = "Department Action Plan: 2026-2027";
      const dept = "Department of Artificial Intelligence";
      const coord = "Mr. A. Charles";
      const shift = "Shift II";
      
      db.run("INSERT INTO staff_involvement_categories (id, name, department, coordinator, shift) VALUES (?, ?, ?, ?, ?)",
        [catId, catName, dept, coord, shift],
        (err) => {
          if (err) return console.error("Seeding involvement category failed:", err.message);
          console.log("Seeding involvement category succeeded.");
          
          const records = [];
          
          // Part A
          records.push(
            { sec: "Part A", c1: "1", c2: "PhD Programme", c3: "-" },
            { sec: "Part A", c1: "2", c2: "PG Programme", c3: "Mr. A. Charles" },
            { sec: "Part A", c1: "3", c2: "UG Programme", c3: "Mr. A. Charles" },
            { sec: "Part A", c1: "4", c2: "MQC\nNote: Assign faculty members with five or more years of experience", c3: "1. Dr. J.Hirudhaya Mary Asha\n2. Mr. C. Mohanraja\n3. Mr Mr.Jesudoss" },
            { sec: "Part A", c1: "5", c2: "JosTEL", c3: "Mr. C. Mohanraja" },
            { sec: "Part A", c1: "6", c2: "Question Bank\nNote: For SPL & Comprehensive Courses", c3: "UG\nSPL: Dr. J.Hirudhaya Mary Asha\nCE: Nil\n\nPG\nSPL: Mr. C. Mohanraja\nCE: Nil" },
            { sec: "Part A", c1: "7", c2: "Internship", c3: "UG: Dr. J.Hirudhaya Mary Asha\nPG: Mr. C. Mohanraja" },
            { sec: "Part A", c1: "8", c2: "Project", c3: "UG: Dr. J.Hirudhaya Mary Asha\nPG: Mr. C. Mohanraja" },
            { sec: "Part A", c1: "9", c2: "MOOCs", c3: "UG: I Yr: Ms. V. Infine Sinduja\nII Yr:Dr. S.Lakshmanan\nPG: I Yr: Mr M.Jesudoss" },
            { sec: "Part A", c1: "10", c2: "Student Progression", c3: "UG: I Yr: Ms. V. Infine Sinduja\nII Yr: Dr. S.Lakshmanan\nIII Yr: Dr. J. Hirudhaya Mary Asha\nPG: I Yr: Mr M.Jesudoss\nII Yr: Mr. C. Mohanraja" },
            { sec: "Part A", c1: "11", c2: "Placement", c3: "UG: Dr. J.Hirudhaya Mary Asha\nPG: Mr. C. Mohanraja" },
            { sec: "Part A", c1: "12", c2: "Industry Collaboration", c3: "Mr. C. Mohanraja, Mr. M. Jesudoss" },
            { sec: "Part A", c1: "13", c2: "Coaching Programmes for Competitive Exams", c3: "Mr. C. Mohanraja\nMs. P. Diana Jennifer" },
            { sec: "Part A", c1: "14", c2: "Association", c3: "President: Dr. S. Josephine Theresa\nVice – President: Dr. S. Lakshmanan" },
            { sec: "Part A", c1: "15", c2: "INDEP", c3: "Dr. S. Josephine Theresa\nDr. S. Lakshmanan" },
            { sec: "Part A", c1: "16", c2: "Sports Activities", c3: "Dr. S. Josephine Theresa\nDr. S. Lakshmanan\nMs. P. Diana Jennifer" },
            { sec: "Part A", c1: "17", c2: "Consultancy & Corporate Training", c3: "Mr. A. Charles, Mr. C. Mohanraja" },
            { sec: "Part A", c1: "18", c2: "Girls' Student In-charge", c3: "Ms. V. Infine Sinduja, Dr. T.Thilagavathi" },
            { sec: "Part A", c1: "19", c2: "SHEPHERD", c3: "Boys: Dr. S. Lakshmanan\nGirls: Dr. T.Thilagavathi" },
            { sec: "Part A", c1: "20", c2: "Department Inventory & Procurement", c3: "Mr. A. Charles, Mr. C. Mohanraja" },
            { sec: "Part A", c1: "21", c2: "Department Library", c3: "Mr.M.Jesudoss, Ms. G. Keerthana Darathi" },
            { sec: "Part A", c1: "22", c2: "Department Website", c3: "Mr.M.Jesudoss, Dr. S. Josephine Theresa,\nMs. G. Keerthana Darathi" },
            { sec: "Part A", c1: "23", c2: "Specific Lab(s) in the Department", c3: "Nil" }
          );
          
          // Clubs
          records.push(
            { sec: "Clubs", c1: "1", c2: "Coder’s Club", c3: "Technical", c4: "Dr. J.Hirudhaya Mary Asha\nMs. V. Infine Sinduja" },
            { sec: "Clubs", c1: "2", c2: "Zestia Club", c3: "Cultural", c4: "Dr. T. Thilagavathi\nMs. P. Diana Jennifer" }
          );
          
          // Class Mentors
          records.push(
            { sec: "Class Mentors", c1: "I UG", c2: "Ms. V. Infine Sinduja" },
            { sec: "Class Mentors", c1: "II UG", c2: "Dr. S.Lakshmanan" },
            { sec: "Class Mentors", c1: "III UG", c2: "Dr. J. Hirudhaya Mary Asha" },
            { sec: "Class Mentors", c1: "I PG", c2: "Mr M.Jesudoss" },
            { sec: "Class Mentors", c1: "II PG", c2: "Mr. C. Mohanraja" }
          );
          
          // Part B
          records.push(
            { sec: "Part B", c1: "1", c2: "Value-Added Course", c3: "-", c4: "-", c5: "-" },
            { sec: "Part B", c1: "2", c2: "Certificate Course", c3: "July-August", c4: "III UG & II PG", c5: "Mr. C. Mohanraja\nDr.J.Hirudhaya Mary Asha\nMr.M.Jesudoss\nDr.S.Josephine Theresa\nMs.P.Diana Jennifer" },
            { sec: "Part B", c1: "3", c2: "Association Inauguration", c3: "July", c4: "Department Students", c5: "Dr.S.Josephine Theresa\nDr.S.Lakshmanan" },
            { sec: "Part B", c1: "4", c2: "Association Valediction", c3: "February", c4: "Department Students", c5: "Dr.S.Josephine Theresa\nDr.S.Lakshmanan" },
            { sec: "Part B", c1: "5", c2: "Skill Development Programmes", c3: "July", c4: "UG I Yr:\nII Yr:\nIII Yr\nPG: I Yr:", c5: "Ms. V. Infine Sinduja\nDr. S.Lakshmanan\nDr. J. Hirudhaya Mary Asha\nMr M.Jesudoss" },
            { sec: "Part B", c1: "6", c2: "Technical Club Activities", c3: "July-February", c4: "Department Students", c5: "Dr. J.Hirudhaya Mary Asha\nMs. V. Infine Sinduja" },
            { sec: "Part B", c1: "7", c2: "Cultural Club Activities", c3: "July-February", c4: "Department Students/ Inter College/ Interdepartment", c5: "Dr. T. Thilagavathi\nMs. P. Diana Jennifer" },
            { sec: "Part B", c1: "8", c2: "Technical / Cultural Festival", c3: "September", c4: "Department Students/ Inter College/ Interdepartment", c5: "Dr.J.Hirudhaya Mary Asha\nMr.C.Mohanraja\nMr.M.Jesudoss" },
            { sec: "Part B", c1: "9", c2: "Diversity & Inclusion Activities", c3: "October", c4: "Department students", c5: "Ms. P. Diana Jennifer\nMs. G. Keerthana Darathi" },
            { sec: "Part B", c1: "10", c2: "Ideation Workshops / Hackathons", c3: "December", c4: "Department students", c5: "Dr. S. Lakshmanan\nDr. T. Thilagavathi" },
            { sec: "Part B", c1: "11", c2: "Mental Health / Wellness Activities", c3: "January", c4: "Department students", c5: "Ms. V. Infine Sinduja" },
            { sec: "Part B", c1: "12", c2: "Gender Sensitization & Health Programmes", c3: "September", c4: "Department", c5: "Dr.S.Josephine Theresa" },
            { sec: "Part B", c1: "13", c2: "Community Awareness and Social Outreach Activities", c3: "July", c4: "School students", c5: "Dr.J.Hirudhaya Mary Asha" },
            { sec: "Part B", c1: "14", c2: "IKS Activities", c3: "September", c4: "Department Students", c5: "Mr.C.Mohanraja" },
            { sec: "Part B", c1: "15", c2: "Remedial Coaching", c3: "-", c4: "II UG Students", c5: "Dr.S.Lakshmanan" },
            { sec: "Part B", c1: "16", c2: "Educational Tour", c3: "July", c4: "III UG", c5: "Dr.J.Hirudhaya Mary Asha" },
            { sec: "Part B", c1: "17", c2: "Parent – Teacher Meet (other than the common meeting by the College)", c3: "September", c4: "UG I Yr:\nII Yr:\nIII Yr\nPG: I Yr:\nII Yr:", c5: "Ms. V. Infine Sinduja\nDr. S.Lakshmanan\nDr. J. Hirudhaya Mary Asha\nMr M.Jesudoss\nMr. C. Mohanraja" },
            { sec: "Part B", c1: "18", c2: "Alumni Meeting (other than the Global Reunion)", c3: "-", c4: "-", c5: "-" },
            { sec: "Part B", c1: "19", c2: "Endowment Lecture(s)\n1.\n2.", c3: "-", c4: "-", c5: "-" }
          );
          
          // Conferences
          records.push(
            { sec: "Conferences", c1: "1", c2: "Teaching Pedagogy", c3: "FDP", c4: "N", c5: "July", c6: "Dr.T.Thilagavthi", c7: "-", c8: "-" },
            { sec: "Conferences", c1: "2", c2: "Empowering Teaching with AI tools", c3: "FDP", c4: "N", c5: "November", c6: "Mr.M.Jesudoss", c7: "-", c8: "Yes" },
            { sec: "Conferences", c1: "3", c2: "3D Printing-Robotics", c3: "Workshop", c4: "N", c5: "July", c6: "Dr.J.Hirudhaya Mary Asha", c7: "-", c8: "Yes" }
          );
          
          // AAA Proposed Plan
          records.push(
            { sec: "AAA Proposed Plan", c1: "1", c2: "Provide certificate courses for AI students", c3: "July", c4: "Mr. C. Mohanraja\nDr.J.Hirudhaya Mary Asha" },
            { sec: "AAA Proposed Plan", c1: "2", c2: "Provide training for placement aptitude and technical skills", c3: "July", c4: "Mr. C. Mohanraja\nMs.P. Diana Jennifer" },
            { sec: "AAA Proposed Plan", c1: "3", c2: "Conducting National level Seminar with industry colloboration", c3: "September", c4: "Mr.C.Mohanraja" },
            { sec: "AAA Proposed Plan", c1: "4", c2: "Arrange industrial visits to software companies", c3: "September", c4: "Mr. A. Charles,\nMr.C.Mohanraja" },
            { sec: "AAA Proposed Plan", c1: "5", c2: "Encourage student mini-projects solving societal problems", c3: "July- December", c4: "Dr.J.Hirudhaya Mary Asha" }
          );
          
          let completed = 0;
          records.forEach(r => {
            db.run("INSERT INTO staff_involvement_records (category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [catId, r.sec, r.c1, r.c2, r.c3 || '', r.c4 || '', r.c5 || '', r.c6 || '', r.c7 || '', r.c8 || ''],
              (err2) => {
                if (err2) console.error("Error seeding record:", err2.message);
                completed++;
                if (completed === records.length) {
                  console.log("Seeding involvement records completed.");
                }
              }
            );
          });
        }
      );
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
  const { title, description, deadline, shifts_scope } = req.body;
  const id = 'evt-' + Date.now();
  const created_at = new Date().toISOString();
  const scope = shifts_scope || 'Shift 1,Shift 2,Combined Department';

  db.run("INSERT INTO events (id, title, description, created_at, deadline, shifts_scope) VALUES (?, ?, ?, ?, ?, ?)", [id, title, description, created_at, deadline, scope], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, title, description, created_at, deadline, shifts_scope: scope });
  });
});

app.put('/api/events/:id', (req, res) => {
  const { title, description, deadline, shifts_scope } = req.body;
  if (!title || !description || !deadline || !shifts_scope) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.run("UPDATE events SET title = ?, description = ?, deadline = ?, shifts_scope = ? WHERE id = ?", [title, description, deadline, shifts_scope, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event updated successfully' });
  });
});

app.delete('/api/events/:id', (req, res) => {
  db.run("DELETE FROM submissions WHERE event_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
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

// Event visibility toggle endpoint
app.patch('/api/events/:id/visibility', (req, res) => {
  const { is_visible_public } = req.body;
  const val = is_visible_public ? 1 : 0;
  db.run("UPDATE events SET is_visible_public = ? WHERE id = ?", [val, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, is_visible_public: val });
  });
});

// Staff Involvement: Get all categories
app.get('/api/involvement/categories', (req, res) => {
  db.all("SELECT * FROM staff_involvement_categories ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Staff Involvement: Add new category card
app.post('/api/involvement/categories', (req, res) => {
  const { name, department, coordinator, shift } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  const id = 'cat-' + Date.now();
  db.run("INSERT INTO staff_involvement_categories (id, name, department, coordinator, shift) VALUES (?, ?, ?, ?, ?)",
    [id, name, department || null, coordinator || null, shift || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE') || err.message.includes('duplicate key') || err.code === '23505') {
          return res.status(400).json({ error: 'A department action plan card with this name already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, name, department, coordinator, shift });
    }
  );
});

// Staff Involvement: Update category card details
app.put('/api/involvement/categories/:id', (req, res) => {
  const { name, department, coordinator, shift } = req.body;
  db.run("UPDATE staff_involvement_categories SET name = COALESCE(?, name), department = ?, coordinator = ?, shift = ? WHERE id = ?",
    [name, department, coordinator, shift, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: req.params.id, name, department, coordinator, shift });
    }
  );
});

// Staff Involvement: Delete category card
app.delete('/api/involvement/categories/:id', (req, res) => {
  db.run("DELETE FROM staff_involvement_categories WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Category deleted successfully' });
  });
});

// Staff Involvement: Get all records
app.get('/api/involvement/records', (req, res) => {
  db.all("SELECT * FROM staff_involvement_records ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Staff Involvement: Add record manually
app.post('/api/involvement/records', (req, res) => {
  const { category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8 } = req.body;
  if (!category_id || !section_type) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }
  db.run("INSERT INTO staff_involvement_records (category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8 });
    }
  );
});

// Staff Involvement: Bulk import records
app.post('/api/involvement/records/bulk', (req, res) => {
  const { category_id, records, clear_existing } = req.body;
  if (!category_id || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  
  const insertRecords = () => {
    if (records.length === 0) return res.json({ success: true, count: 0 });
    
    let completed = 0;
    let errors = 0;
    
    records.forEach(r => {
      db.run("INSERT INTO staff_involvement_records (category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [category_id, r.section_type, r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8],
        function(err) {
          if (err) errors++;
          completed++;
          if (completed === records.length) {
            res.json({ success: true, count: completed - errors, failed: errors });
          }
        }
      );
    });
  };

  if (clear_existing) {
    db.run("DELETE FROM staff_involvement_records WHERE category_id = ?", [category_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      insertRecords();
    });
  } else {
    insertRecords();
  }
});

// Staff Involvement: Delete record
app.delete('/api/involvement/records/:id', (req, res) => {
  db.run("DELETE FROM staff_involvement_records WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Record deleted successfully' });
  });
});

// Staff Involvement: Update record status and remark
app.put('/api/involvement/records/:id/status', (req, res) => {
  const { status, remark } = req.body;
  db.run("UPDATE staff_involvement_records SET status = ?, remark = ? WHERE id = ?",
    [status, remark, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: req.params.id, status, remark });
    }
  );
});

// ================= EARN WHILE YOU LEARN (EWYL) ENDPOINTS =================

// 1. Get all EWYL students
app.get('/api/ewyl/students', (req, res) => {
  db.all("SELECT * FROM ewyl_students ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Add an EWYL student
app.post('/api/ewyl/students', (req, res) => {
  const { name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name } = req.body;
  if (!name || !reg_no || !dept_name || !bank_name || !account_no || !ifsc_code || !branch_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.run(
    "INSERT INTO ewyl_students (name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name],
    function(err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Registration Number already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name });
    }
  );
});

// 3. Edit EWYL student
app.put('/api/ewyl/students/:id', (req, res) => {
  const { name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name } = req.body;
  if (!name || !reg_no || !dept_name || !bank_name || !account_no || !ifsc_code || !branch_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.run(
    "UPDATE ewyl_students SET name = ?, reg_no = ?, dept_name = ?, bank_name = ?, account_no = ?, ifsc_code = ?, branch_name = ? WHERE id = ?",
    [name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name, req.params.id],
    function(err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Registration Number already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: req.params.id, name, reg_no, dept_name, bank_name, account_no, ifsc_code, branch_name });
    }
  );
});

// 4. Delete EWYL student
app.delete('/api/ewyl/students/:id', (req, res) => {
  db.run("DELETE FROM ewyl_students WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student and associated logs deleted successfully' });
  });
});

// 5. Get hours for a student in a month
app.get('/api/ewyl/hours', (req, res) => {
  const { student_id, month } = req.query;
  if (!student_id || !month) {
    return res.status(400).json({ error: 'Missing student_id or month' });
  }
  db.all(
    "SELECT * FROM ewyl_hours WHERE student_id = ? AND month_active = ? ORDER BY date ASC, in_time ASC",
    [student_id, month],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// 6. Log working hours
app.post('/api/ewyl/hours', (req, res) => {
  const { student_id, date, in_time, out_time, month_active } = req.body;
  if (!student_id || !date || !in_time || !out_time || !month_active) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Calculate hours
  const [inH, inM] = in_time.split(':').map(Number);
  const [outH, outM] = out_time.split(':').map(Number);
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;

  if (outMinutes <= inMinutes) {
    return res.status(400).json({ error: 'OUT time must be after IN time' });
  }

  const total_hours = Number(((outMinutes - inMinutes) / 60).toFixed(2));

  db.run(
    "INSERT INTO ewyl_hours (student_id, date, in_time, out_time, total_hours, month_active) VALUES (?, ?, ?, ?, ?, ?)",
    [student_id, date, in_time, out_time, total_hours, month_active],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, student_id, date, in_time, out_time, total_hours, month_active });
    }
  );
});

// 7. Delete an hour log entry
app.delete('/api/ewyl/hours/:id', (req, res) => {
  db.run("DELETE FROM ewyl_hours WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Hours log entry deleted successfully' });
  });
});

// 8. Get monthly summary report of all students
app.get('/api/ewyl/summary', (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ error: 'Missing month parameter' });
  }

  const sql = `
    SELECT 
      s.id, s.name, s.reg_no, s.dept_name, s.bank_name, s.account_no, s.ifsc_code, s.branch_name,
      COALESCE(SUM(h.total_hours), 0) AS total_hours
    FROM ewyl_students s
    LEFT JOIN ewyl_hours h ON s.id = h.student_id AND h.month_active = ?
    GROUP BY s.id, s.name, s.reg_no, s.dept_name, s.bank_name, s.account_no, s.ifsc_code, s.branch_name
    ORDER BY s.name ASC
  `;

  db.all(sql, [month], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const formatted = rows.map(r => ({
      ...r,
      total_hours: Number(Number(r.total_hours).toFixed(2)),
      remuneration: Number((Number(r.total_hours) * 40).toFixed(2))
    }));
    
    res.json(formatted);
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
