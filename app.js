// IQAC Portal Application Logic (Light Theme, Database Integrated)

const API_BASE = '/api';

// Core State
let state = {
  currentUser: null,
  activeSubView: null,
  events: [],
  departments: [],
  users: [],
  selectedEventId: null,
  
  // Checklist filters
  checklistTab: 'all',
  checklistSearch: '',
  checklistStatus: 'all',
  
  // Director checklist filters
  directorTab: 'all',
  directorSearch: '',
  directorStatus: 'all'
};

// 1. Time Display & Header
function startClock() {
  const clockEl = document.getElementById('header-time-info');
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, 1000);
}

// 2. Late Submission Detection helpers
function isSubmissionLate(receivedTime, deadlineStr) {
  if (!receivedTime || !deadlineStr) return false;
  const rec = new Date(receivedTime);
  const dead = new Date(deadlineStr);
  if (isNaN(rec.getTime()) || isNaN(dead.getTime())) return false;
  return rec > dead;
}

function getLateDurationText(receivedTime, deadlineStr) {
  const rec = new Date(receivedTime);
  const dead = new Date(deadlineStr);
  const diffMs = rec - dead;
  if (diffMs <= 0 || isNaN(diffMs)) return '';
  
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} min late`;
  } else if (diffHours < 24) {
    return `${diffHours} hrs late`;
  } else {
    return `${diffDays} days late`;
  }
}

function formatSubmissionTime(timeStr) {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) {
    // If localized string already stored from initial seed
    return timeStr;
  }
  return date.toLocaleString();
}

// 3. API Communication Methods

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

// Load arrays from database
async function loadEvents() {
  state.events = await fetchAPI('/events');
}

async function loadDepartments() {
  state.departments = await fetchAPI('/departments');
}

async function loadUsers() {
  state.users = await fetchAPI('/users');
}

// 4. Authentication & Session
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const user = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    loginUser(user);
  } catch (err) {
    // Error is already alerted in fetchAPI
  }
});

function loginUser(userData) {
  state.currentUser = userData;
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'flex';
  
  document.getElementById('current-username').innerText = userData.name;
  document.getElementById('current-userrole').innerText = userData.role;
  
  // Toggle side menu views
  if (userData.role === 'Staff') {
    document.getElementById('staff-menu').style.display = 'flex';
    document.getElementById('director-menu').style.display = 'none';
    switchSubView('staff-dashboard');
  } else {
    document.getElementById('staff-menu').style.display = 'none';
    document.getElementById('director-menu').style.display = 'flex';
    switchSubView('director-dashboard');
  }
  
  localStorage.setItem('iqac_session', JSON.stringify(userData));
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem('iqac_session');
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

function checkSession() {
  const session = localStorage.getItem('iqac_session');
  if (session) {
    loginUser(JSON.parse(session));
  }
}

// 5. Views Switcher Router
async function switchSubView(viewId) {
  state.activeSubView = viewId;
  
  // Hide all screens
  document.querySelectorAll('.subview').forEach(view => {
    view.style.display = 'none';
  });
  
  // Remove sidebar menu items highlights
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Load latest data on navigation before rendering
  if (viewId === 'staff-dashboard') {
    document.getElementById('subview-staff-dashboard').style.display = 'block';
    document.getElementById('menu-staff-dashboard').classList.add('active');
    document.getElementById('header-title').innerText = 'Staff Dashboard';
    await loadEvents();
    await loadDepartments();
    renderStaffDashboard();
  } else if (viewId === 'staff-events') {
    document.getElementById('subview-staff-events').style.display = 'block';
    document.getElementById('menu-staff-events').classList.add('active');
    document.getElementById('header-title').innerText = 'Manage Events';
    await loadEvents();
    renderManageEvents();
  } else if (viewId === 'staff-departments') {
    document.getElementById('subview-staff-departments').style.display = 'block';
    document.getElementById('menu-staff-departments').classList.add('active');
    document.getElementById('header-title').innerText = 'Manage Departments';
    await loadDepartments();
    renderStaffDepartments();
  } else if (viewId === 'staff-checklist') {
    document.getElementById('subview-staff-checklist').style.display = 'block';
    document.getElementById('header-title').innerText = 'Checklist Submission Work Area';
    renderStaffChecklist();
  } else if (viewId === 'director-dashboard') {
    document.getElementById('subview-director-dashboard').style.display = 'block';
    document.getElementById('menu-director-dashboard').classList.add('active');
    document.getElementById('header-title').innerText = 'Director Dashboard';
    await loadEvents();
    await loadDepartments();
    renderDirectorDashboard();
  } else if (viewId === 'director-users') {
    document.getElementById('subview-director-users').style.display = 'block';
    document.getElementById('menu-director-users').classList.add('active');
    document.getElementById('header-title').innerText = 'User Access Control';
    await loadUsers();
    renderDirectorUsers();
  } else if (viewId === 'director-detail') {
    document.getElementById('subview-director-detail').style.display = 'block';
    document.getElementById('header-title').innerText = 'Detailed Report Status';
    renderDirectorDetail();
  }
}

// 6. Stats & Calculations
function getEventStats(evt, checklists) {
  let total = state.departments.length;
  let received = 0;
  let remarks = 0;
  let pending = 0;
  
  state.departments.forEach(dept => {
    const chk = checklists[dept.id] || { status: 'pending' };
    if (chk.status === 'received') received++;
    else if (chk.status === 'remarks') remarks++;
    else pending++;
  });
  
  const percentage = total > 0 ? Math.round((received / total) * 100) : 0;
  return { total, received, remarks, pending, percentage };
}

// Format relative date display
function formatRelativeDeadline(deadlineStr) {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffTime < 0) {
    const daysAgo = Math.abs(diffDays);
    return `<span class="deadline-badge deadline-passed"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Passed (${daysAgo === 0 ? 'today' : daysAgo + ' days ago'})</span>`;
  } else {
    return `<span class="deadline-badge deadline-active"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Active (${diffDays} days left)</span>`;
  }
}

// 7. RENDER STAFF DASHBOARD
async function renderStaffDashboard() {
  const container = document.getElementById('staff-dashboard-events-table');
  container.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading events...</td></tr>';
  
  let totalReceived = 0;
  let totalRemarks = 0;
  let totalPending = 0;
  let activeEventsCount = 0;

  let tableContent = '';
  
  for (let evt of state.events) {
    // Fetch submissions checklist for this event
    const checklists = await fetchAPI(`/submissions/${evt.id}`);
    const stats = getEventStats(evt, checklists);
    
    totalReceived += stats.received;
    totalRemarks += stats.remarks;
    totalPending += stats.pending;
    
    if (new Date(evt.deadline) >= new Date()) {
      activeEventsCount++;
    }

    tableContent += `
      <tr>
        <td>
          <span class="event-row-title">${evt.title}</span>
          <span class="event-row-desc">${evt.description}</span>
        </td>
        <td>${new Date(evt.created_at).toLocaleDateString()}</td>
        <td>
          <div>${new Date(evt.deadline).toLocaleDateString()}</div>
          <div style="font-size:11px; margin-top:2px;">${formatRelativeDeadline(evt.deadline)}</div>
        </td>
        <td>
          <span style="font-weight: 600;">${stats.received}</span>/${stats.total} Received
        </td>
        <td>
          <div style="display:flex; align-items:center; gap: 8px;">
            <div class="progress-bar-container" style="width: 80px;">
              <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
            </div>
            <span style="font-size:12px; font-weight:600;">${stats.percentage}%</span>
          </div>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openEventChecklist('${evt.id}')">
            Open Checklist
          </button>
        </td>
      </tr>
    `;
  }

  container.innerHTML = tableContent;

  // Update staff stats labels
  document.getElementById('staff-stat-active-events').innerText = activeEventsCount;
  document.getElementById('staff-stat-total-received').innerText = totalReceived;
  document.getElementById('staff-stat-total-remarks').innerText = totalRemarks;
  document.getElementById('staff-stat-total-pending').innerText = totalPending;

  if (state.events.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">!</div>
          <h4>No Events Created</h4>
          <p>Go to "Manage Events" to add your first reporting schedule.</p>
        </td>
      </tr>
    `;
  }
}

// 8. RENDER MANAGE EVENTS SCREEN
async function renderManageEvents() {
  const container = document.getElementById('staff-events-list-table');
  container.innerHTML = '';
  
  for (let evt of state.events) {
    const checklists = await fetchAPI(`/submissions/${evt.id}`);
    const stats = getEventStats(evt, checklists);
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="event-row-title">${evt.title}</span>
        <span class="event-row-desc">${evt.description}</span>
      </td>
      <td>${new Date(evt.created_at).toLocaleString()}</td>
      <td>
        <div>${new Date(evt.deadline).toLocaleString()}</div>
        <div style="font-size:11px; margin-top:2px;">${formatRelativeDeadline(evt.deadline)}</div>
      </td>
      <td>
        <div style="font-size: 13px;">
          <span class="badge badge-received">${stats.received} Rec</span>
          <span class="badge badge-remarks">${stats.remarks} Rem</span>
          <span class="badge badge-pending">${stats.pending} Pend</span>
        </div>
      </td>
      <td style="text-align: right;">
        <div class="action-cell" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="openEventChecklist('${evt.id}')" title="Edit Checklist">
            Checklist
          </button>
          <button class="btn btn-secondary btn-sm btn-icon-only" onclick="openEditEventModal('${evt.id}')" title="Edit Event">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteEvent('${evt.id}')" title="Delete Event">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  }

  if (state.events.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-state-icon">!</div>
          <h4>No Events Found</h4>
          <p>Click "Add New Event" to set up a deadline checklist.</p>
        </td>
      </tr>
    `;
  }
}

// Manage Event Modals
function openCreateEventModal() {
  document.getElementById('event-modal-title').textContent = 'Create New Event';
  document.getElementById('event-submit-btn').textContent = 'Create Event';
  document.getElementById('event-edit-id').value = '';
  document.getElementById('create-event-form').reset();
  
  document.getElementById('create-event-modal').classList.add('open');
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset());
  document.getElementById('event-deadline').value = defaultDate.toISOString().slice(0, 16);
}

function openEditEventModal(eventId) {
  const evt = state.events.find(e => e.id === eventId);
  if (!evt) return;

  document.getElementById('event-modal-title').textContent = 'Edit Event';
  document.getElementById('event-submit-btn').textContent = 'Save Changes';
  document.getElementById('event-edit-id').value = eventId;
  
  document.getElementById('event-title').value = evt.title;
  document.getElementById('event-desc').value = evt.description;
  
  const dateObj = new Date(evt.deadline);
  dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
  document.getElementById('event-deadline').value = dateObj.toISOString().slice(0, 16);

  document.getElementById('create-event-modal').classList.add('open');
}

function closeCreateEventModal() {
  document.getElementById('create-event-modal').classList.remove('open');
  document.getElementById('create-event-form').reset();
  document.getElementById('event-edit-id').value = '';
}

document.getElementById('create-event-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const title = document.getElementById('event-title').value.trim();
  const description = document.getElementById('event-desc').value.trim();
  const deadline = new Date(document.getElementById('event-deadline').value).toISOString();
  const editId = document.getElementById('event-edit-id').value;

  try {
    if (editId) {
      await fetchAPI(`/events/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, deadline })
      });
    } else {
      await fetchAPI('/events', {
        method: 'POST',
        body: JSON.stringify({ title, description, deadline })
      });
    }
    
    closeCreateEventModal();
    await loadEvents();
    renderManageEvents();
  } catch(err) {
    // Handled
  }
});

async function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event? All checklist records will be deleted!")) {
    try {
      await fetchAPI(`/events/${eventId}`, { method: 'DELETE' });
      await loadEvents();
      renderManageEvents();
    } catch(err) {}
  }
}


// 9. DEPARTMENT MANAGEMENT (Staff Access)
function renderStaffDepartments() {
  const container = document.getElementById('staff-departments-list-table');
  container.innerHTML = '';

  const searchVal = document.getElementById('dept-search-input').value.toLowerCase();
  const shiftVal = document.getElementById('dept-shift-filter').value;

  const filtered = state.departments.filter(dept => {
    if (shiftVal !== 'all' && dept.shift !== shiftVal) return false;
    if (searchVal && !dept.name.toLowerCase().includes(searchVal) && !dept.category.toLowerCase().includes(searchVal)) return false;
    return true;
  });

  filtered.forEach(dept => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${dept.name}</td>
      <td>${dept.category}</td>
      <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:12px;">${dept.shift}</span></td>
      <td style="text-align: right;">
        <div class="action-cell" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="openDeptModal('${dept.id}')">Edit</button>
          <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteDepartment('${dept.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div class="empty-state-icon">?</div>
          <h4>No Departments Listed</h4>
          <p>Create a department using the "Add Department" button.</p>
        </td>
      </tr>
    `;
  }
}

function openDeptModal(deptId = null) {
  const modal = document.getElementById('dept-modal');
  const title = document.getElementById('dept-modal-title');
  const nameInput = document.getElementById('dept-name');
  const catInput = document.getElementById('dept-category');
  const shiftInput = document.getElementById('dept-shift');
  const editIdInput = document.getElementById('dept-edit-id');

  if (deptId) {
    title.innerText = 'Edit Department';
    const dept = state.departments.find(d => d.id === deptId);
    nameInput.value = dept.name;
    catInput.value = dept.category;
    shiftInput.value = dept.shift;
    editIdInput.value = deptId;
  } else {
    title.innerText = 'Add Department';
    nameInput.value = '';
    catInput.value = '';
    shiftInput.value = 'Shift 1';
    editIdInput.value = '';
  }

  modal.classList.add('open');
}

function closeDeptModal() {
  document.getElementById('dept-modal').classList.remove('open');
  document.getElementById('dept-form').reset();
}

document.getElementById('dept-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('dept-edit-id').value;
  const name = document.getElementById('dept-name').value.trim();
  const category = document.getElementById('dept-category').value.trim();
  const shift = document.getElementById('dept-shift').value;

  try {
    if (id) {
      // Edit
      await fetchAPI(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, category, shift })
      });
    } else {
      // Add
      await fetchAPI('/departments', {
        method: 'POST',
        body: JSON.stringify({ name, category, shift })
      });
    }

    closeDeptModal();
    await loadDepartments();
    renderStaffDepartments();
  } catch(err) {}
});

async function deleteDepartment(deptId) {
  if (confirm("Are you sure you want to delete this department? This will delete all its submission records across all checklists!")) {
    try {
      await fetchAPI(`/departments/${deptId}`, { method: 'DELETE' });
      await loadDepartments();
      renderStaffDepartments();
    } catch(err) {}
  }
}


// 10. CHECKLIST WORK AREA (Staff Access)
async function openEventChecklist(eventId) {
  state.selectedEventId = eventId;
  state.checklistTab = 'all';
  state.checklistSearch = '';
  state.checklistStatus = 'all';
  
  document.getElementById('checklist-search-input').value = '';
  document.getElementById('checklist-status-filter').value = 'all';
  
  switchSubView('staff-checklist');
}

function setChecklistTab(tabName) {
  state.checklistTab = tabName;
  document.querySelectorAll('#checklist-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.innerText.trim() === tabName || (tabName === 'all' && btn.innerText.includes('All'))) {
      btn.classList.add('active');
    }
  });
  renderStaffChecklist();
}

function filterChecklist() {
  state.checklistSearch = document.getElementById('checklist-search-input').value.toLowerCase();
  state.checklistStatus = document.getElementById('checklist-status-filter').value;
  renderStaffChecklist();
}

async function renderStaffChecklist() {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  const checklists = await fetchAPI(`/submissions/${evt.id}`);

  document.getElementById('checklist-event-title').innerText = evt.title;
  document.getElementById('checklist-event-deadline').innerHTML = 'Deadline: ' + new Date(evt.deadline).toLocaleString() + ' • ' + formatRelativeDeadline(evt.deadline);
  
  const stats = getEventStats(evt, checklists);
  const compEl = document.getElementById('checklist-completion-percentage');
  compEl.innerText = `Completion: ${stats.percentage}% (${stats.received}/${stats.total} Submitted)`;

  const container = document.getElementById('checklist-departments-table');
  container.innerHTML = '';

  const filteredDepts = state.departments.filter(dept => {
    // 1. Shift Tab
    if (state.checklistTab !== 'all') {
      if (state.checklistTab === 'Shift 1' && dept.shift !== 'Shift 1') return false;
      if (state.checklistTab === 'Shift 2' && dept.shift !== 'Shift 2') return false;
      if (state.checklistTab === 'Administrative Units' && dept.shift !== 'Administrative Units') return false;
    }

    // 2. Search
    if (state.checklistSearch) {
      const nameMatch = dept.name.toLowerCase().includes(state.checklistSearch);
      const catMatch = dept.category.toLowerCase().includes(state.checklistSearch);
      if (!nameMatch && !catMatch) return false;
    }

    // 3. Status filter
    const chk = checklists[dept.id] || { status: 'pending' };
    const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);

    if (state.checklistStatus !== 'all') {
      if (state.checklistStatus === 'pending' && chk.status !== 'pending') return false;
      if (state.checklistStatus === 'remarks' && chk.status !== 'remarks') return false;
      if (state.checklistStatus === 'received' && (chk.status !== 'received' || isLate)) return false;
      if (state.checklistStatus === 'delayed' && (chk.status !== 'received' || !isLate)) return false;
    }

    return true;
  });

  filteredDepts.forEach(dept => {
    const chk = checklists[dept.id] || { status: 'pending', receivedTime: null, remarks: null };
    const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);
    
    let statusBadge = '';
    let infoSection = '-';
    let actionButtons = '';

    if (chk.status === 'received') {
      const formattedTime = formatSubmissionTime(chk.receivedTime);
      if (isLate) {
        statusBadge = `<span class="badge badge-delayed">Delayed Submission</span>`;
        infoSection = `
          <div class="delayed-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Late Submission: ${formattedTime} <span style="font-weight:700;">(${getLateDurationText(chk.receivedTime, evt.deadline)})</span>
          </div>
        `;
      } else {
        statusBadge = `<span class="badge badge-received">Received</span>`;
        infoSection = `
          <div class="ontime-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
            Received: ${formattedTime}
          </div>
        `;
      }
      
      actionButtons = `
        <button class="btn btn-secondary btn-sm" onclick="openRemarksModal('${dept.id}')">Add Remark</button>
        <button class="btn btn-danger btn-sm btn-icon-only" onclick="updateChecklistStatus('${dept.id}', 'pending')" title="Reset status">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
        </button>
      `;
    } else if (chk.status === 'remarks') {
      statusBadge = `<span class="badge badge-remarks">Needs Correction</span>`;
      infoSection = `
        <div class="remark-text-bubble">
          <strong>Corrections:</strong><br>${chk.remarks}
        </div>
      `;
      actionButtons = `
        <button class="btn btn-primary btn-sm" onclick="updateChecklistStatus('${dept.id}', 'received')">Click Received</button>
        <button class="btn btn-secondary btn-sm" onclick="openRemarksModal('${dept.id}')">Edit Remark</button>
      `;
    } else {
      statusBadge = `<span class="badge badge-pending">Pending</span>`;
      actionButtons = `
        <button class="btn btn-primary btn-sm" onclick="updateChecklistStatus('${dept.id}', 'received')">Click Received</button>
        <button class="btn btn-secondary btn-sm" onclick="openRemarksModal('${dept.id}')">Add Remark</button>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${dept.name}</td>
      <td>
        <span style="font-size: 13px; color: var(--text-muted);">${dept.category}</span><br>
        <span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${dept.shift}</span>
      </td>
      <td>${statusBadge}</td>
      <td>${infoSection}</td>
      <td style="text-align: right;">
        <div class="action-cell" style="justify-content: flex-end;">
          ${actionButtons}
        </div>
      </td>
    `;
    container.appendChild(tr);
  });

  if (filteredDepts.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-state-icon">?</div>
          <h4>No Departments Match Filters</h4>
        </td>
      </tr>
    `;
  }
}

async function updateChecklistStatus(deptId, newStatus) {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  const payload = {
    event_id: evt.id,
    department_id: deptId,
    status: newStatus,
    received_time: newStatus === 'received' ? new Date().toISOString() : null,
    remarks: null
  };

  await fetchAPI('/submissions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  renderStaffChecklist();
}

// Remarks update modal
async function openRemarksModal(deptId) {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  const dept = state.departments.find(d => d.id === deptId);
  if (!evt || !dept) return;

  const checklists = await fetchAPI(`/submissions/${evt.id}`);
  const chk = checklists[deptId] || {};

  document.getElementById('remarks-dept-id').value = deptId;
  document.getElementById('remarks-dept-label').innerText = `Department: ${dept.name} (${dept.shift})`;
  document.getElementById('remarks-text-input').value = chk.remarks || '';
  
  document.getElementById('remarks-modal').classList.add('open');
}

function closeRemarksModal() {
  document.getElementById('remarks-modal').classList.remove('open');
  document.getElementById('remarks-form').reset();
}

document.getElementById('remarks-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const deptId = document.getElementById('remarks-dept-id').value;
  const remarksText = document.getElementById('remarks-text-input').value.trim();

  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  const payload = {
    event_id: evt.id,
    department_id: deptId,
    status: 'remarks',
    received_time: null,
    remarks: remarksText
  };

  try {
    await fetchAPI('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    closeRemarksModal();
    renderStaffChecklist();
  } catch(err) {}
});


// 11. DIRECTOR DASHBOARD VIEW
async function renderDirectorDashboard() {
  const container = document.getElementById('director-dashboard-events-table');
  container.innerHTML = '';
  
  let totalEvents = state.events.length;
  let accumulatedProgress = 0;

  for (let evt of state.events) {
    const checklists = await fetchAPI(`/submissions/${evt.id}`);
    const stats = getEventStats(evt, checklists);
    accumulatedProgress += stats.percentage;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="event-row-title">${evt.title}</span>
        <span class="event-row-desc">${evt.description}</span>
      </td>
      <td>${new Date(evt.created_at).toLocaleDateString()}</td>
      <td>
        <div>${new Date(evt.deadline).toLocaleDateString()}</div>
        <div style="font-size:11px; margin-top:2px;">${formatRelativeDeadline(evt.deadline)}</div>
      </td>
      <td>
        <span style="font-weight: 600;">${stats.received}</span> / ${stats.total} Units
      </td>
      <td>
        <div style="display:flex; align-items:center; gap: 8px;">
          <div class="progress-bar-container" style="width: 120px;">
            <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
          </div>
          <span style="font-size:12px; font-weight:600;">${stats.percentage}%</span>
        </div>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openDirectorDetail('${evt.id}')">
          View Detail Status
        </button>
      </td>
    `;
    container.appendChild(tr);
  }

  const avgProgress = totalEvents > 0 ? Math.round(accumulatedProgress / totalEvents) : 0;
  
  document.getElementById('director-stat-total-events').innerText = totalEvents;
  document.getElementById('director-stat-avg-progress').innerText = `${avgProgress}%`;

  if (totalEvents === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">!</div>
          <h4>No Active Monitoring Schedules</h4>
        </td>
      </tr>
    `;
  }
}

// 12. DIRECTOR: DETAILED VIEW (Sorting rules applied)
async function openDirectorDetail(eventId) {
  state.selectedEventId = eventId;
  state.directorTab = 'all';
  state.directorSearch = '';
  state.directorStatus = 'all';
  
  document.getElementById('director-search-input').value = '';
  document.getElementById('director-status-filter').value = 'all';

  switchSubView('director-detail');
}

function setDirectorTab(tabName) {
  state.directorTab = tabName;
  document.querySelectorAll('#director-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.innerText.trim() === tabName || (tabName === 'all' && btn.innerText.includes('All'))) {
      btn.classList.add('active');
    }
  });
  renderDirectorDetail();
}

function filterDirectorChecklist() {
  state.directorSearch = document.getElementById('director-search-input').value.toLowerCase();
  state.directorStatus = document.getElementById('director-status-filter').value;
  renderDirectorDetail();
}

async function renderDirectorDetail() {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  const checklists = await fetchAPI(`/submissions/${evt.id}`);

  document.getElementById('director-detail-event-title').innerText = evt.title;
  document.getElementById('director-detail-event-deadline').innerHTML = 'Deadline: ' + new Date(evt.deadline).toLocaleString() + ' • ' + formatRelativeDeadline(evt.deadline);

  const stats = getEventStats(evt, checklists);
  const badge = document.getElementById('director-detail-completion-badge');
  badge.innerText = `Completion: ${stats.percentage}% (${stats.received}/${stats.total} Submitted)`;

  const container = document.getElementById('director-detail-checklist-table');
  container.innerHTML = '';

  // 1. Filter
  let filteredDepts = state.departments.filter(dept => {
    // tab
    if (state.directorTab !== 'all') {
      if (state.directorTab === 'Shift 1' && dept.shift !== 'Shift 1') return false;
      if (state.directorTab === 'Shift 2' && dept.shift !== 'Shift 2') return false;
      if (state.directorTab === 'Administrative Units' && dept.shift !== 'Administrative Units') return false;
    }

    // search
    if (state.directorSearch) {
      const nameMatch = dept.name.toLowerCase().includes(state.directorSearch);
      const catMatch = dept.category.toLowerCase().includes(state.directorSearch);
      if (!nameMatch && !catMatch) return false;
    }

    // status filters
    const chk = checklists[dept.id] || { status: 'pending' };
    const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);

    if (state.directorStatus !== 'all') {
      if (state.directorStatus === 'unsubmitted' && chk.status === 'received') return false;
      if (state.directorStatus === 'submitted' && chk.status !== 'received') return false;
      if (state.directorStatus === 'remarks' && chk.status !== 'remarks') return false;
      if (state.directorStatus === 'delayed' && (chk.status !== 'received' || !isLate)) return false;
    }

    return true;
  });

  // 2. SORTING: Unsubmitted departments (pending/remarks) come first. Submitted (received) come second.
  filteredDepts.sort((a, b) => {
    const chkA = checklists[a.id] || { status: 'pending' };
    const chkB = checklists[b.id] || { status: 'pending' };

    const valA = chkA.status === 'received' ? 1 : 0;
    const valB = chkB.status === 'received' ? 1 : 0;

    return valA - valB; // 0 comes before 1
  });

  // 3. Render
  filteredDepts.forEach(dept => {
    const chk = checklists[dept.id] || { status: 'pending', receivedTime: null, remarks: null };
    const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);
    
    let statusBadge = '';
    let detailsSection = '-';

    if (chk.status === 'received') {
      const formattedTime = formatSubmissionTime(chk.receivedTime);
      if (isLate) {
        statusBadge = `<span class="badge badge-delayed">Delayed Submission</span>`;
        detailsSection = `
          <div class="delayed-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Late Submission: ${formattedTime} <span style="font-weight:700;">(${getLateDurationText(chk.receivedTime, evt.deadline)})</span>
          </div>
        `;
      } else {
        statusBadge = `<span class="badge badge-received">Received</span>`;
        detailsSection = `
          <div class="ontime-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
            Received: ${formattedTime}
          </div>
        `;
      }
    } else if (chk.status === 'remarks') {
      statusBadge = `<span class="badge badge-remarks">Correction Remarks</span>`;
      detailsSection = `
        <div class="remark-text-bubble">
          <strong>Remark details:</strong><br>${chk.remarks}
        </div>
      `;
    } else {
      statusBadge = `<span class="badge badge-pending">Not Submitted</span>`;
      detailsSection = `<span style="color:var(--text-muted); font-size:13px; font-style:italic;">No records received yet</span>`;
    }

    const tr = document.createElement('tr');
    if (chk.status !== 'received') {
      tr.style.background = '#fcf8f2'; // Soft tint highlighting unsubmitted items
    }

    tr.innerHTML = `
      <td style="font-weight: 600;">${dept.name}</td>
      <td>
        <span style="font-size: 13px; color: var(--text-muted);">${dept.category}</span><br>
        <span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${dept.shift}</span>
      </td>
      <td>${statusBadge}</td>
      <td>${detailsSection}</td>
    `;
    container.appendChild(tr);
  });

  if (filteredDepts.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div class="empty-state-icon">?</div>
          <h4>No Departments Found</h4>
        </td>
      </tr>
    `;
  }
}


// 13. USER ACCESS CONTROL (Director Only)
function renderDirectorUsers() {
  const container = document.getElementById('director-users-list-table');
  container.innerHTML = '';

  state.users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${user.name}</td>
      <td><code>${user.username}</code></td>
      <td><span style="font-weight:600; color:${user.role === 'Director' ? 'var(--primary)' : 'var(--accent)'};">${user.role}</span></td>
      <td style="text-align: right;">
        <div class="action-cell" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="openUserModal(${user.id})">Edit/Password</button>
          <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteUser(${user.id})" ${state.currentUser.id === user.id ? 'disabled title="You cannot delete yourself!" style="opacity:0.3; cursor:not-allowed;"' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  });
}

function openUserModal(userId = null) {
  const modal = document.getElementById('user-modal');
  const title = document.getElementById('user-modal-title');
  const nameInput = document.getElementById('user-fullname');
  const usernameInput = document.getElementById('user-username');
  const passInput = document.getElementById('user-password');
  const passLabel = document.getElementById('user-password-label');
  const roleInput = document.getElementById('user-role');
  const editIdInput = document.getElementById('user-edit-id');

  if (userId) {
    title.innerText = 'Edit User Credentials';
    const user = state.users.find(u => u.id === userId);
    nameInput.value = user.name;
    usernameInput.value = user.username;
    passInput.value = '';
    passInput.required = false;
    passLabel.innerHTML = 'Password <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(Leave blank to keep current)</span>';
    roleInput.value = user.role;
    editIdInput.value = userId;
  } else {
    title.innerText = 'Add New System User';
    nameInput.value = '';
    usernameInput.value = '';
    passInput.value = '';
    passInput.required = true;
    passLabel.innerText = 'Password';
    roleInput.value = 'Staff';
    editIdInput.value = '';
  }

  modal.classList.add('open');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('open');
  document.getElementById('user-form').reset();
}

document.getElementById('user-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('user-edit-id').value;
  const name = document.getElementById('user-fullname').value.trim();
  const username = document.getElementById('user-username').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;

  const payload = { name, username, role };
  if (password) payload.password = password;

  try {
    if (id) {
      // Edit
      await fetchAPI(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      // Add
      if (!password) {
        alert('Password is required for new users!');
        return;
      }
      await fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify({ ...payload, password })
      });
    }

    closeUserModal();
    await loadUsers();
    renderDirectorUsers();
  } catch(err) {}
});

async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user? They will lose access immediately.")) {
    try {
      await fetchAPI(`/users/${userId}`, { method: 'DELETE' });
      await loadUsers();
      renderDirectorUsers();
    } catch(err) {}
  }
}


// 14. App Bootstrapping
window.addEventListener('DOMContentLoaded', async () => {
  // Try loading initial data from backend. If backend is running, it will fetch from SQLite.
  try {
    await loadEvents();
    await loadDepartments();
  } catch(e) {
    console.warn("Backend not running or offline. Please run `npm start` to connect database.");
  }
  
  checkSession();
  startClock();
});
