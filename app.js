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
    document.getElementById('user-menu').style.display = 'none';
    switchSubView('staff-dashboard');
  } else if (userData.role === 'Director') {
    document.getElementById('staff-menu').style.display = 'none';
    document.getElementById('director-menu').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
    switchSubView('director-dashboard');
  } else if (userData.role === 'User') {
    document.getElementById('staff-menu').style.display = 'none';
    document.getElementById('director-menu').style.display = 'none';
    document.getElementById('user-menu').style.display = 'flex';
    switchSubView('user-action-plan');
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
    const menuEl = document.getElementById('menu-staff-users') || document.getElementById('menu-director-users');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'User Access Control';
    await loadUsers();
    renderDirectorUsers();
  } else if (viewId === 'director-detail') {
    document.getElementById('subview-director-detail').style.display = 'block';
    document.getElementById('header-title').innerText = 'Detailed Report Status';
    renderDirectorDetail();
  } else if (viewId === 'staff-involvement') {
    document.getElementById('subview-staff-involvement').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-involvement');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Staff Involvement Cards';
    await loadInvolvementData();
    renderStaffInvolvement();
  } else if (viewId === 'staff-involvement-detail') {
    document.getElementById('subview-staff-involvement-detail').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-involvement');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Category Details';
    renderCategoryDetailPage();
  } else if (viewId === 'public-status') {
    document.getElementById('subview-public-status').style.display = 'block';
    document.getElementById('header-title').innerText = 'IQAC Public Activity Checklist Status';
    await loadEvents();
    renderPublicStatusDashboard();
  } else if (viewId === 'user-action-plan') {
    document.getElementById('subview-user-action-plan').style.display = 'block';
    const menuEl = document.getElementById('menu-user-action-plan');
    if (menuEl) menuEl.classList.add('active');
    const menuElStaff = document.getElementById('menu-staff-action-plan');
    if (menuElStaff) menuElStaff.classList.add('active');
    document.getElementById('header-title').innerText = 'Department Action Plan Form';
    await loadDepartments();
    await loadInvolvementData();
    renderUserActionPlanForm();
  }
}

// 6. Stats & Calculations
function getEventStats(evt, checklists) {
  const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
  const targetDepts = state.departments.filter(dept => scope.includes(dept.shift));
  
  let total = targetDepts.length;
  let received = 0;
  let remarks = 0;
  let pending = 0;
  
  targetDepts.forEach(dept => {
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
let dashboardSortColumn = '';
let dashboardSortDirection = '';

function sortDashboardEvents(columnKey, direction) {
  dashboardSortColumn = columnKey;
  dashboardSortDirection = direction;
  renderStaffDashboard();
}

async function renderStaffDashboard() {
  const container = document.getElementById('staff-dashboard-events-table');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading events...</td></tr>';
  
  let totalReceived = 0;
  let totalRemarks = 0;
  let totalPending = 0;
  let activeEventsCount = 0;

  let sortedEvents = [...state.events];
  if (dashboardSortColumn && dashboardSortDirection) {
    sortedEvents.sort((a, b) => {
      let valA, valB;
      if (dashboardSortColumn === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (dashboardSortColumn === 'created') {
        valA = new Date(a.created_at || 0);
        valB = new Date(b.created_at || 0);
      } else if (dashboardSortColumn === 'deadline') {
        valA = new Date(a.deadline || 0);
        valB = new Date(b.deadline || 0);
      }
      
      if (valA < valB) return dashboardSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return dashboardSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  let tableContent = '';
  
  for (let evt of sortedEvents) {
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
          <label class="switch" style="vertical-align: middle;">
            <input type="checkbox" ${evt.is_visible_public !== 0 ? 'checked' : ''} onchange="toggleEventVisibility('${evt.id}', this.checked)">
            <span class="slider"></span>
          </label>
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
  const actEl = document.getElementById('staff-stat-active-events');
  if (actEl) actEl.innerText = activeEventsCount;
  const recEl = document.getElementById('staff-stat-total-received');
  if (recEl) recEl.innerText = totalReceived;
  const remEl = document.getElementById('staff-stat-total-remarks');
  if (remEl) remEl.innerText = totalRemarks;
  const penEl = document.getElementById('staff-stat-total-pending');
  if (penEl) penEl.innerText = totalPending;

  if (sortedEvents.length === 0 || tableContent === '') {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon">!</div>
          <h4>No Events Found</h4>
          <p>Go to "Manage Events" to add your first reporting schedule.</p>
        </td>
      </tr>
    `;
  }
}

async function toggleEventVisibility(eventId, isVisible) {
  try {
    const res = await fetchAPI(`/events/${eventId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ is_visible_public: isVisible ? 1 : 0 })
    });
    // Update local state
    const localEvt = state.events.find(e => e.id === eventId);
    if (localEvt) {
      localEvt.is_visible_public = isVisible ? 1 : 0;
    }
  } catch (err) {
    console.error("Failed to toggle event visibility:", err);
    alert("Could not update event visibility.");
  }
}

function filterStaffDashboardTable() {
  renderStaffDashboard();
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
  
  // Check all scopes by default
  document.getElementById('event-scope-shift1').checked = true;
  document.getElementById('event-scope-shift2').checked = true;
  document.getElementById('event-scope-admin').checked = true;
  
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
  
  // Set scopes checkboxes
  const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
  document.getElementById('event-scope-shift1').checked = scope.includes('Shift 1');
  document.getElementById('event-scope-shift2').checked = scope.includes('Shift 2');
  document.getElementById('event-scope-admin').checked = scope.includes('Combined Department');
  
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

  const selectedShifts = [];
  if (document.getElementById('event-scope-shift1').checked) selectedShifts.push('Shift 1');
  if (document.getElementById('event-scope-shift2').checked) selectedShifts.push('Shift 2');
  if (document.getElementById('event-scope-admin').checked) selectedShifts.push('Combined Department');

  if (selectedShifts.length === 0) {
    alert("Please select at least one target shift / department group.");
    return;
  }
  const shifts_scope = selectedShifts.join(',');

  try {
    if (editId) {
      await fetchAPI(`/events/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, deadline, shifts_scope })
      });
    } else {
      await fetchAPI('/events', {
        method: 'POST',
        body: JSON.stringify({ title, description, deadline, shifts_scope })
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
    // Filter by event shifts scope
    const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
    if (!scope.includes(dept.shift)) return false;

    // 1. Shift Tab
    if (state.checklistTab !== 'all') {
      if (state.checklistTab === 'Shift 1' && dept.shift !== 'Shift 1') return false;
      if (state.checklistTab === 'Shift 2' && dept.shift !== 'Shift 2') return false;
      if (state.checklistTab === 'Combined Department' && dept.shift !== 'Combined Department') return false;
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

  const shiftOrder = { 'Shift 1': 1, 'Shift 2': 2, 'Combined Department': 3 };
  filteredDepts.sort((a, b) => {
    const orderA = shiftOrder[a.shift] || 99;
    const orderB = shiftOrder[b.shift] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  filteredDepts.forEach(dept => {
    const chk = checklists[dept.id] || { status: 'pending', receivedTime: null, remarks: null };
    const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);
    
    let statusDropdown = `
      <select class="form-select status-select-dropdown" onchange="handleChecklistStatusChange('${dept.id}', this.value)" style="height: 32px; font-size: 13px; padding: 0 8px; border-radius: 6px; width: 145px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); ${chk.status === 'received' ? (isLate ? 'color: #ef4444; border-color: #fca5a5; background: #fee2e2;' : 'color: #10b981; border-color: #6ee7b7; background: #d1fae5;') : (chk.status === 'remarks' ? 'color: #d97706; border-color: #fcd34d; background: #fef3c7;' : 'color: #64748b; border-color: #cbd5e1; background: #f1f5f9;')};">
        <option value="pending" ${chk.status === 'pending' || !chk.status ? 'selected' : ''}>Pending</option>
        <option value="received" ${chk.status === 'received' && !isLate ? 'selected' : ''}>Received</option>
        <option value="delayed" ${chk.status === 'received' && isLate ? 'selected' : ''}>Delay</option>
        <option value="remarks" ${chk.status === 'remarks' ? 'selected' : ''}>Remarks</option>
      </select>
    `;
    
    let infoSection = '-';
    let actionButtons = '';

    if (chk.status === 'received') {
      const formattedTime = formatSubmissionTime(chk.receivedTime);
      if (isLate) {
        infoSection = `
          <div class="delayed-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Late Submission: ${formattedTime} <span style="font-weight:700;">(${getLateDurationText(chk.receivedTime, evt.deadline)})</span>
          </div>
        `;
      } else {
        infoSection = `
          <div class="ontime-submission-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
            Received: ${formattedTime}
          </div>
        `;
      }
      
      actionButtons = `
        <button class="btn btn-secondary btn-sm" onclick="openReceivedTimeModal('${dept.id}')">Edit Time</button>
        <button class="btn btn-secondary btn-sm" onclick="openRemarksModal('${dept.id}')">Add Remark</button>
      `;
    } else if (chk.status === 'remarks') {
      infoSection = `
        <div class="remark-text-bubble">
          <strong>Corrections:</strong><br>${chk.remarks || ''}
        </div>
      `;
      actionButtons = `
        <button class="btn btn-secondary btn-sm" onclick="openRemarksModal('${dept.id}')">Edit Remark</button>
      `;
    } else {
      actionButtons = `
        <button class="btn btn-secondary btn-sm" onclick="openReceivedTimeModal('${dept.id}')">Make Status</button>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${dept.name}</td>
      <td>
        <span style="font-size: 13px; color: var(--text-muted);">${dept.category}</span><br>
        <span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${dept.shift}</span>
      </td>
      <td>${statusDropdown}</td>
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

async function handleChecklistStatusChange(deptId, value) {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  try {
    if (value === 'pending') {
      const payload = {
        event_id: evt.id,
        department_id: deptId,
        status: 'pending',
        received_time: null,
        remarks: null
      };
      await fetchAPI('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      renderStaffChecklist();
    } else if (value === 'received') {
      const now = new Date();
      const deadlineDate = new Date(evt.deadline);
      let time;
      if (now < deadlineDate) {
        time = now.toISOString();
      } else {
        time = new Date(deadlineDate.getTime() - 60000).toISOString(); // 1 min before deadline
      }
      const payload = {
        event_id: evt.id,
        department_id: deptId,
        status: 'received',
        received_time: time,
        remarks: null
      };
      await fetchAPI('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      renderStaffChecklist();
    } else if (value === 'delayed') {
      const now = new Date();
      const deadlineDate = new Date(evt.deadline);
      let time;
      if (now > deadlineDate) {
        time = now.toISOString();
      } else {
        time = new Date(deadlineDate.getTime() + 60000).toISOString(); // 1 min after deadline
      }
      const payload = {
        event_id: evt.id,
        department_id: deptId,
        status: 'received',
        received_time: time,
        remarks: null
      };
      await fetchAPI('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      renderStaffChecklist();
    } else if (value === 'remarks') {
      openRemarksModal(deptId);
    }
  } catch (err) {
    console.error("Failed to update checklist status:", err);
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

// Received Time selection modal
let currentTimeInterval = null;

function openReceivedTimeModal(deptId) {
  const dept = state.departments.find(d => d.id === deptId);
  if (!dept) return;

  document.getElementById('received-time-dept-id').value = deptId;
  document.getElementById('received-time-dept-label').innerText = `Department: ${dept.name} (${dept.shift})`;
  
  // Reset choices
  document.querySelector('input[name="time-option"][value="current"]').checked = true;
  document.getElementById('manual-time-input-group').style.display = 'none';
  document.getElementById('option-current-wrapper').style.borderColor = 'var(--primary)';
  document.getElementById('option-manual-wrapper').style.borderColor = 'var(--card-border)';
  
  // Set default manual time to now (local timezone adjusted)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('manual-received-time').value = now.toISOString().slice(0, 16);

  // Current time live preview
  const updatePreview = () => {
    const previewEl = document.getElementById('current-time-preview');
    if (previewEl) previewEl.innerText = new Date().toLocaleString();
  };
  updatePreview();
  clearInterval(currentTimeInterval);
  currentTimeInterval = setInterval(updatePreview, 1000);

  document.getElementById('received-time-modal').classList.add('open');
}

function closeReceivedTimeModal() {
  clearInterval(currentTimeInterval);
  document.getElementById('received-time-modal').classList.remove('open');
}

function toggleManualTimeInput() {
  const isManual = document.querySelector('input[name="time-option"]:checked').value === 'manual';
  document.getElementById('manual-time-input-group').style.display = isManual ? 'block' : 'none';
  
  if (isManual) {
    document.getElementById('option-manual-wrapper').style.borderColor = 'var(--primary)';
    document.getElementById('option-current-wrapper').style.borderColor = 'var(--card-border)';
  } else {
    document.getElementById('option-current-wrapper').style.borderColor = 'var(--primary)';
    document.getElementById('option-manual-wrapper').style.borderColor = 'var(--card-border)';
  }
}

document.getElementById('received-time-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const deptId = document.getElementById('received-time-dept-id').value;
  const isManual = document.querySelector('input[name="time-option"]:checked').value === 'manual';
  
  let receivedTime;
  if (isManual) {
    const val = document.getElementById('manual-received-time').value;
    receivedTime = new Date(val).toISOString();
  } else {
    receivedTime = new Date().toISOString();
  }

  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) return;

  try {
    const payload = {
      event_id: evt.id,
      department_id: deptId,
      status: 'received',
      received_time: receivedTime,
      remarks: null
    };

    await fetchAPI('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    closeReceivedTimeModal();
    renderStaffChecklist();
  } catch (err) {
    // Handled
  }
});

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
  renderStaffChecklist();
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
  container.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading monitoring data...</td></tr>';
  
  let totalEvents = state.events.length;
  let accumulatedProgress = 0;

  let ontimeCount = 0;
  let delayedCount = 0;
  let remarksCount = 0;
  let pendingCount = 0;

  const shiftStats = {
    'Shift 1': { ontime: 0, delayed: 0, remarks: 0, pending: 0 },
    'Shift 2': { ontime: 0, delayed: 0, remarks: 0, pending: 0 },
    'Combined Department': { ontime: 0, delayed: 0, remarks: 0, pending: 0 }
  };

  let tableContent = '';

  for (let evt of state.events) {
    const checklists = await fetchAPI(`/submissions/${evt.id}`);
    const stats = getEventStats(evt, checklists);
    accumulatedProgress += stats.percentage;

    // Accumulate stats for charts
    const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
    const targetDepts = state.departments.filter(dept => scope.includes(dept.shift));

    targetDepts.forEach(dept => {
      const chk = checklists[dept.id] || { status: 'pending', receivedTime: null };
      const shift = dept.shift;
      if (!shiftStats[shift]) {
        shiftStats[shift] = { ontime: 0, delayed: 0, remarks: 0, pending: 0 };
      }

      if (chk.status === 'received') {
        if (isSubmissionLate(chk.receivedTime, evt.deadline)) {
          delayedCount++;
          shiftStats[shift].delayed++;
        } else {
          ontimeCount++;
          shiftStats[shift].ontime++;
        }
      } else if (chk.status === 'remarks') {
        remarksCount++;
        shiftStats[shift].remarks++;
      } else {
        pendingCount++;
        shiftStats[shift].pending++;
      }
    });

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
      </tr>
    `;
  }

  container.innerHTML = tableContent;

  const avgProgress = totalEvents > 0 ? Math.round(accumulatedProgress / totalEvents) : 0;
  
  document.getElementById('director-stat-total-events').innerText = totalEvents;
  document.getElementById('director-stat-avg-progress').innerText = `${avgProgress}%`;
  document.getElementById('director-stat-ontime').innerText = ontimeCount;
  document.getElementById('director-stat-delayed').innerText = delayedCount;
  document.getElementById('director-stat-remarks').innerText = remarksCount;
  document.getElementById('director-stat-pending').innerText = pendingCount;

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

  // Render Charts
  renderDirectorCharts({
    ontime: ontimeCount,
    delayed: delayedCount,
    remarks: remarksCount,
    pending: pendingCount,
    shiftStats: shiftStats
  });
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
    // Filter by event shifts scope
    const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
    if (!scope.includes(dept.shift)) return false;

    // tab
    if (state.directorTab !== 'all') {
      if (state.directorTab === 'Shift 1' && dept.shift !== 'Shift 1') return false;
      if (state.directorTab === 'Shift 2' && dept.shift !== 'Shift 2') return false;
      if (state.directorTab === 'Combined Department' && dept.shift !== 'Combined Department') return false;
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

  // 2. SORTING: Sort by shift order first, and then alphabetically as a secondary key
  const shiftOrder = { 'Shift 1': 1, 'Shift 2': 2, 'Combined Department': 3 };
  filteredDepts.sort((a, b) => {
    const orderA = shiftOrder[a.shift] || 99;
    const orderB = shiftOrder[b.shift] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
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
    roleInput.value = 'User';
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

// ================= EXPORT UTILITIES (Excel / PDF) =================
function downloadCSV(csvContent, filename) {
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function getExportData(selectedShift = 'all') {
  const evt = state.events.find(e => e.id === state.selectedEventId);
  if (!evt) {
    alert("No event selected.");
    return null;
  }

  try {
    const checklists = await fetchAPI(`/submissions/${evt.id}`);
    
    // Determine active view and filter set
    const isDirector = state.activeSubView === 'director-detail';
    const activeSearch = isDirector ? state.directorSearch : state.checklistSearch;
    const activeStatus = isDirector ? state.directorStatus : state.checklistStatus;

    // Filter departments
    let targetDepts = state.departments.filter(dept => {
      // 0. shifts scope
      const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
      if (!scope.includes(dept.shift)) return false;

      // 1. Shift filter (selected in export dialog)
      if (selectedShift !== 'all') {
        if (dept.shift !== selectedShift) return false;
      }

      // 2. Search
      if (activeSearch) {
        const nameMatch = dept.name.toLowerCase().includes(activeSearch);
        const catMatch = dept.category.toLowerCase().includes(activeSearch);
        if (!nameMatch && !catMatch) return false;
      }

      // 3. Status filter
      const chk = checklists[dept.id] || { status: 'pending' };
      const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);

      if (activeStatus !== 'all') {
        if (isDirector) {
          if (activeStatus === 'unsubmitted' && chk.status === 'received') return false;
          if (activeStatus === 'submitted' && chk.status !== 'received') return false;
          if (activeStatus === 'remarks' && chk.status !== 'remarks') return false;
          if (activeStatus === 'delayed' && (chk.status !== 'received' || !isLate)) return false;
        } else {
          if (activeStatus === 'pending' && chk.status !== 'pending') return false;
          if (activeStatus === 'remarks' && chk.status !== 'remarks') return false;
          if (activeStatus === 'received' && (chk.status !== 'received' || isLate)) return false;
          if (activeStatus === 'delayed' && (chk.status !== 'received' || !isLate)) return false;
        }
      }

      return true;
    });

    // Sort shift-wise and department alphabetical ascending
    const shiftOrder = { 'Shift 1': 1, 'Shift 2': 2, 'Combined Department': 3 };
    targetDepts.sort((a, b) => {
      const orderA = shiftOrder[a.shift] || 99;
      const orderB = shiftOrder[b.shift] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

    const rows = targetDepts.map(dept => {
      const chk = checklists[dept.id] || { status: 'pending', receivedTime: null, remarks: null };
      const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);
      
      let statusText = 'Pending';
      if (chk.status === 'received') {
        statusText = isLate ? 'Received (Late)' : 'Received (On Time)';
      } else if (chk.status === 'remarks') {
        statusText = 'Needs Correction';
      }

      let submittedTimeStr = '-';
      if (chk.receivedTime) {
        submittedTimeStr = new Date(chk.receivedTime).toLocaleString();
        if (isLate) {
          submittedTimeStr += ` (Late by ${getLateDurationText(chk.receivedTime, evt.deadline)})`;
        }
      }

      return {
        department: dept.name,
        category: dept.category,
        shift: dept.shift,
        status: statusText,
        submittedAt: submittedTimeStr,
        remarks: chk.remarks || '-'
      };
    });

    // Return current filter settings for document headers
    const filterDesc = [];
    filterDesc.push(`Exported Shift: ${selectedShift === 'all' ? 'All' : selectedShift}`);
    if (activeSearch) filterDesc.push(`Search: "${activeSearch}"`);
    if (activeStatus !== 'all') filterDesc.push(`Status: ${activeStatus}`);
    
    return { 
      event: evt, 
      rows, 
      filterInfo: filterDesc.length > 0 ? `Export Scope: ${filterDesc.join(', ')}` : 'All Records'
    };
  } catch (err) {
    console.error("Failed to load export data:", err);
    alert("Failed to load latest checklist details for export.");
    return null;
  }
}

function openExportModal(format) {
  document.getElementById('export-format-type').value = format;
  document.getElementById('export-modal-title').innerText = format === 'excel' ? 'Export to Excel (CSV)' : 'Export to PDF';
  document.getElementById('export-submit-btn').innerText = format === 'excel' ? 'Download Excel' : 'Download PDF';
  document.getElementById('export-shift-filter').value = 'all';
  document.getElementById('export-modal').classList.add('open');
}

function closeExportModal() {
  document.getElementById('export-modal').classList.remove('open');
}

// Add the submit listener for export-form
document.getElementById('export-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const format = document.getElementById('export-format-type').value;
  const shiftFilter = document.getElementById('export-shift-filter').value;
  closeExportModal();

  if (format === 'excel') {
    await runExportExcel(shiftFilter);
  } else {
    await runExportPDF(shiftFilter);
  }
});

async function exportChecklistExcel() {
  openExportModal('excel');
}

async function exportChecklistPDF() {
  openExportModal('pdf');
}

async function runExportExcel(shiftFilter) {
  const data = await getExportData(shiftFilter);
  if (!data) return;

  const { event, rows } = data;
  
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '';
    const stringified = String(str).replace(/"/g, '""');
    if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
      return `"${stringified}"`;
    }
    return stringified;
  };

  const csvHeaders = ['Department', 'Category', 'Shift', 'Status', 'Submitted At', 'Remarks / Correction Notes'];
  const csvRows = [
    [escapeCsv('Event Title:'), escapeCsv(event.title)],
    [escapeCsv('Deadline:'), escapeCsv(new Date(event.deadline).toLocaleString())],
    [escapeCsv('Report Scope:'), escapeCsv(data.filterInfo)],
    [],
    csvHeaders
  ];

  rows.forEach(r => {
    csvRows.push([
      escapeCsv(r.department),
      escapeCsv(r.category),
      escapeCsv(r.shift),
      escapeCsv(r.status),
      escapeCsv(r.submittedAt),
      escapeCsv(r.remarks)
    ]);
  });

  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist_${shiftFilter.replace(/\s+/g, '_').toLowerCase()}.csv`;
  
  downloadCSV(csvContent, filename);
}

async function runExportPDF(shiftFilter) {
  const data = await getExportData(shiftFilter);
  if (!data) return;

  const { event, rows } = data;
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header styling (premium corporate look)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(109, 40, 217); // Premium Violet
    doc.text("Internal Quality Assurance Cell (IQAC)", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Dark Slate
    doc.text(`Event Checklist Status: ${event.title}`, 14, 28);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Deadline: ${new Date(event.deadline).toLocaleString()}`, 14, 34);
    doc.text(`Report Scope: ${data.filterInfo}`, 14, 40);
    
    const total = rows.length;
    const received = rows.filter(r => r.status.startsWith('Received')).length;
    const pending = rows.filter(r => r.status === 'Pending').length;
    const remarks = rows.filter(r => r.status === 'Needs Correction').length;
    
    doc.text(`Stats: ${received} Submitted, ${remarks} Needs Correction, ${pending} Pending (Total matching: ${total})`, 14, 46);

    // Prepare table columns and rows
    const tableHeaders = [['Department', 'Shift', 'Status', 'Submitted At', 'Remarks']];
    const tableBody = rows.map(r => [
      r.department,
      r.shift,
      r.status,
      r.submittedAt,
      r.remarks
    ]);

    doc.autoTable({
      startY: 52,
      head: tableHeaders,
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 'auto' }
      }
    });

    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist_${shiftFilter.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF. Make sure the browser is online and scripts are loaded.");
  }
}


// ================= DIRECTOR CHARTING =================
function renderDirectorCharts(stats) {
  if (window.statusChartInstance) {
    window.statusChartInstance.destroy();
  }
  if (window.shiftChartInstance) {
    window.shiftChartInstance.destroy();
  }

  const statusCanvas = document.getElementById('director-status-chart-canvas');
  if (statusCanvas) {
    const statusCtx = statusCanvas.getContext('2d');
    window.statusChartInstance = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['On-Time', 'Late / Delayed', 'Remarks / Correction', 'Pending'],
        datasets: [{
          data: [stats.ontime, stats.delayed, stats.remarks, stats.pending],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: { family: 'Inter, system-ui, sans-serif', size: 11 }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  const shiftCanvas = document.getElementById('director-shift-chart-canvas');
  if (shiftCanvas) {
    const shiftCtx = shiftCanvas.getContext('2d');
    window.shiftChartInstance = new Chart(shiftCtx, {
      type: 'bar',
      data: {
        labels: ['Shift 1', 'Shift 2', 'Combined Department'],
        datasets: [
          {
            label: 'On-Time',
            data: [
              stats.shiftStats['Shift 1']?.ontime || 0,
              stats.shiftStats['Shift 2']?.ontime || 0,
              stats.shiftStats['Combined Department']?.ontime || 0
            ],
            backgroundColor: '#10b981'
          },
          {
            label: 'Late',
            data: [
              stats.shiftStats['Shift 1']?.delayed || 0,
              stats.shiftStats['Shift 2']?.delayed || 0,
              stats.shiftStats['Combined Department']?.delayed || 0
            ],
            backgroundColor: '#ef4444'
          },
          {
            label: 'Remarks',
            data: [
              stats.shiftStats['Shift 1']?.remarks || 0,
              stats.shiftStats['Shift 2']?.remarks || 0,
              stats.shiftStats['Combined Department']?.remarks || 0
            ],
            backgroundColor: '#f59e0b'
          },
          {
            label: 'Pending',
            data: [
              stats.shiftStats['Shift 1']?.pending || 0,
              stats.shiftStats['Shift 2']?.pending || 0,
              stats.shiftStats['Combined Department']?.pending || 0
            ],
            backgroundColor: '#64748b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: false,
            ticks: { color: '#475569', font: { family: 'Inter, system-ui, sans-serif' } },
            grid: { display: false }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: { color: '#475569', font: { family: 'Inter, system-ui, sans-serif' } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              font: { family: 'Inter, system-ui, sans-serif', size: 11 }
            }
          }
        }
      }
    });
  }
}

// ================= STAFF INVOLVEMENT STATE & UI =================

async function loadInvolvementData() {
  state.involvementCategories = await fetchAPI('/involvement/categories');
  state.involvementRecords = await fetchAPI('/involvement/records');
}

function renderStaffInvolvement() {
  const container = document.getElementById('involvement-cards-container');
  if (!container) return;
  
  // Populate global department filter dropdown once or update it
  const deptSelect = document.getElementById('involvement-global-dept');
  if (deptSelect && deptSelect.children.length === 0) {
    const uniqueDepts = [...new Set(state.departments.map(d => d.name))].filter(Boolean);
    deptSelect.innerHTML = '<option value="all">All Departments</option>' +
      uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join('');
  }

  const searchVal = document.getElementById('involvement-global-search') ? document.getElementById('involvement-global-search').value.toLowerCase().trim() : '';
  const selectedDept = document.getElementById('involvement-global-dept') ? document.getElementById('involvement-global-dept').value : 'all';
  const selectedShift = document.getElementById('involvement-global-shift') ? document.getElementById('involvement-global-shift').value : 'all';

  const excelBtn = document.getElementById('btn-export-excel');
  const pdfBtn = document.getElementById('btn-export-pdf');
  if (searchVal) {
    if (excelBtn) excelBtn.innerHTML = '📥 Export Excel (Filtered)';
    if (pdfBtn) pdfBtn.innerHTML = '📄 Export PDF (Filtered)';
  } else {
    if (excelBtn) excelBtn.innerHTML = '📥 Export Excel (All)';
    if (pdfBtn) pdfBtn.innerHTML = '📄 Export PDF (All)';
  }

  container.innerHTML = '';
  
  // If search value is empty, render the cards grid
  if (!searchVal) {
    container.className = 'involvement-grid';
    container.removeAttribute('style');
    
    const filteredCategories = (state.involvementCategories || []).filter(c => {
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      if (selectedShift !== 'all' && c.shift !== selectedShift) return false;
      return true;
    });

    if (filteredCategories.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: #ffffff; border-radius: 12px; border: 1px solid var(--card-border);">
          <h4>No Action Plans Found</h4>
          <p>No cards match your current filters. Click "Add Category Card" or "Bulk Import Plans" to create one.</p>
        </div>
      `;
      return;
    }

    filteredCategories.forEach(category => {
      const cardRecords = (state.involvementRecords || []).filter(r => r.category_id === category.id);
      
      const card = document.createElement('div');
      card.className = 'glass-panel involvement-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.padding = '20px';
      card.style.borderRadius = '16px';
      card.style.border = '1px solid var(--card-border)';
      card.style.background = '#ffffff';
      card.style.gap = '14px';
      card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
      card.style.cursor = 'pointer';
      card.onclick = (e) => {
        if (e.target.closest('.delete-card-btn')) return;
        openCategoryDetailPage(category.id);
      };
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--text-main);">${category.name}</h4>
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Total Records: ${cardRecords.length}</span>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">HOD: ${category.coordinator || '-'}</div>
          </div>
          <button class="btn btn-danger btn-sm delete-card-btn" onclick="deleteInvolvementCategory('${category.id}')" style="padding: 4px 8px; font-size:11px;">
            Delete Card
          </button>
        </div>
        <div style="margin-top: auto; display: flex; justify-content: flex-end;">
          <span style="font-size: 13px; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 4px;">
            View Records Page →
          </span>
        </div>
      `;
      
      container.appendChild(card);
    });
  } else {
    // Render search results view
    container.className = '';
    container.style.display = 'block';
    container.style.width = '100%';
    
    const results = [];
    (state.involvementRecords || []).forEach(r => {
      const category = state.involvementCategories.find(c => c.id === r.category_id);
      if (!category) return;
      
      // Apply filters
      if (selectedDept !== 'all' && category.department !== selectedDept) return;
      if (selectedShift !== 'all' && category.shift !== selectedShift) return;
      
      // Search all columns
      const colsText = [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8]
        .map(v => (v || '').toLowerCase())
        .join(' ');
      
      if (colsText.includes(searchVal)) {
        results.push({ record: r, category });
      }
    });

    if (results.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: #ffffff; border-radius: 12px; border: 1px solid var(--card-border);">
          <h4>No Matching Records Found</h4>
          <p>Try searching for a different staff member name, activity, or keyword.</p>
        </div>
      `;
      return;
    }

    const highlight = (text, query) => {
      if (!text) return '';
      if (!query) return text;
      const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return text.replace(regex, '<mark style="background: #fef08a; color: #1e293b; padding: 1px 3px; border-radius: 2px;">$1</mark>');
    };

    const getSearchResultDetails = (r) => {
      let activity = '';
      let detailsHtml = '';
      
      const highlightVal = (val) => highlight(val || '-', searchVal);

      if (r.section_type === 'Part A') {
        activity = r.col2 || '';
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>S.No:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Area of Responsibility:</strong> ${highlightVal(r.col2)}</div>
            <div><strong>Faculty In-charge:</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col3)}</span></div>
          </div>
        `;
      } else if (r.section_type === 'Clubs') {
        activity = r.col2 || '';
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>S.No:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Club Name:</strong> ${highlightVal(r.col2)}</div>
            <div><strong>Nature of Club:</strong> ${highlightVal(r.col3)}</div>
            <div><strong>Faculty Assigned:</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col4)}</span></div>
          </div>
        `;
      } else if (r.section_type === 'Class Mentors') {
        activity = `Class Mentor - ${r.col1 || ''}`;
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>Class:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Mentor:</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col2)}</span></div>
          </div>
        `;
      } else if (r.section_type === 'Part B') {
        activity = r.col2 || '';
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>S.No:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Activity:</strong> ${highlightVal(r.col2)}</div>
            <div><strong>Tentative Month:</strong> ${highlightVal(r.col3)}</div>
            <div><strong>Class / Target Group:</strong> ${highlightVal(r.col4)}</div>
            <div><strong>Faculty Coordinator:</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col5)}</span></div>
          </div>
        `;
      } else if (r.section_type === 'Conferences') {
        activity = r.col2 || '';
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>S.No:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Title / Theme:</strong> ${highlightVal(r.col2)}</div>
            <div><strong>Type:</strong> ${highlightVal(r.col3)}</div>
            <div><strong>Nature:</strong> ${highlightVal(r.col4)}</div>
            <div><strong>Tentative Month:</strong> ${highlightVal(r.col5)}</div>
            <div><strong>Faculty Coordinator(s):</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col6)}</span></div>
            <div><strong>IKS Aligned:</strong> ${highlightVal(r.col7)}</div>
            <div><strong>SDG Aligned:</strong> ${highlightVal(r.col8)}</div>
          </div>
        `;
      } else if (r.section_type === 'AAA Proposed Plan') {
        activity = r.col2 || '';
        detailsHtml = `
          <div style="font-size: 12px; line-height: 1.5; color: var(--text-main);">
            <div><strong>S.No:</strong> ${highlightVal(r.col1)}</div>
            <div><strong>Planned Activity:</strong> ${highlightVal(r.col2)}</div>
            <div><strong>Tentative Month:</strong> ${highlightVal(r.col3)}</div>
            <div><strong>Faculty Assigned:</strong> <span style="color: var(--primary); font-weight: 600;">${highlightVal(r.col4)}</span></div>
          </div>
        `;
      }
      return { activity, detailsHtml };
    };

    let tableHtml = `
      <div class="glass-panel" style="padding: 20px; overflow: hidden; background: #ffffff;">
        <h4 style="margin-bottom: 16px; font-weight: 600; color: var(--text-main);">Search Results (${results.length} matches)</h4>
        <div class="table-responsive">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
                <th style="padding: 12px 16px;">Department</th>
                <th style="padding: 12px 16px;">Shift</th>
                <th style="padding: 12px 16px;">Section</th>
                <th style="padding: 12px 16px;">Activity / Role</th>
                <th style="padding: 12px 16px;">Whole Details</th>
                <th style="padding: 12px 16px; width: 120px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
    `;

    results.forEach(({ record: r, category: cat }) => {
      const details = getSearchResultDetails(r);
      const deptName = highlight(cat.department || cat.name, searchVal);
      const shiftName = highlight(cat.shift || 'N/A', searchVal);
      const sectionName = r.section_type;
      const activityName = highlight(details.activity, searchVal);

      tableHtml += `
        <tr style="border-bottom: 1px solid var(--card-border); vertical-align: top;">
          <td style="padding: 12px 16px; font-weight: 600;">${deptName}</td>
          <td style="padding: 12px 16px;"><span class="badge" style="background: #f1f5f9; color: var(--text-main); font-size: 11px; padding: 4px 8px; border-radius: 4px;">${shiftName}</span></td>
          <td style="padding: 12px 16px;"><span style="font-size: 12px; font-weight: 600; color: var(--primary);">${sectionName}</span></td>
          <td style="padding: 12px 16px; font-weight: 500;">
            <div>${activityName}</div>
          </td>
          <td style="padding: 12px 16px;">${details.detailsHtml}</td>
          <td style="padding: 12px 16px; text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="goToPlanSection('${cat.id}', '${r.section_type}', '${r.id}')">
              Go to Plan
            </button>
          </td>
        </tr>
      `;
    });

    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = tableHtml;
  }
}function openCategoryDetailPage(categoryId) {
  state.activeCategoryId = categoryId;
  state.activeInvolvementSection = 'Part A';
  
  // Clear search field
  const searchInput = document.getElementById('involvement-detail-search');
  if (searchInput) searchInput.value = '';
  
  // Reset active tab button
  document.querySelectorAll('#subview-staff-involvement-detail .tab-btn').forEach(btn => {
    if (btn.getAttribute('data-section') === 'Part A') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  switchSubView('staff-involvement-detail');
}

function setInvolvementSection(sectionName) {
  state.activeInvolvementSection = sectionName;
  document.querySelectorAll('#subview-staff-involvement-detail .tab-btn').forEach(btn => {
    if (btn.getAttribute('data-section') === sectionName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderCategoryDetailPage();
}

function generateRecordFieldsHTML(sectionType, cardRecords) {
  let nextSNo = 1;
  const nums = cardRecords
    .filter(r => r.section_type === sectionType)
    .map(r => parseInt(r.col1))
    .filter(n => !isNaN(n));
  if (nums.length > 0) {
    nextSNo = Math.max(...nums) + 1;
  }

  if (sectionType === 'Part A') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">S No</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" value="${nextSNo}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Area of Responsibility</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. PhD Programme" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col3">Faculty In-charge</label>
        <textarea id="record-col3" class="form-control" style="padding-left: 16px; min-height: 80px;" placeholder="e.g. Dr. A. Raman" required></textarea>
      </div>
    `;
  }
  if (sectionType === 'Clubs') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">S.No</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" value="${nextSNo}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Club Name</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. Fine Arts Club" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col3">Nature of Club (Technical/Cultural/Domain/ others-specify)</label>
        <input type="text" id="record-col3" class="form-control" style="padding-left: 16px;" placeholder="e.g. Technical" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col4">Faculty Assigned</label>
        <input type="text" id="record-col4" class="form-control" style="padding-left: 16px;" placeholder="e.g. Dr. B. Suresh" required>
      </div>
    `;
  }
  if (sectionType === 'Class Mentors') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">Class</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" placeholder="e.g. I UG, I PG" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Mentor</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. Dr. C. Sekar" required>
      </div>
    `;
  }
  if (sectionType === 'Part B') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">S.No</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" value="${nextSNo}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Activity</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. Value-Added Course" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col3">Tentative Month</label>
        <input type="text" id="record-col3" class="form-control" style="padding-left: 16px;" placeholder="e.g. June - Nov" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col4">Class / Target Group</label>
        <input type="text" id="record-col4" class="form-control" style="padding-left: 16px;" placeholder="e.g. All UG Students" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col5">Faculty Coordinator</label>
        <input type="text" id="record-col5" class="form-control" style="padding-left: 16px;" placeholder="e.g. Dr. D. Peter" required>
      </div>
    `;
  }
  if (sectionType === 'Conferences') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">S.No</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" value="${nextSNo}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Title / Theme</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. National Conference on AI" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col3">Type (C/F/S/W/WB)</label>
        <select id="record-col3" class="form-select" required>
          <option value="">-- Select Type --</option>
          <option value="C">C (Conference)</option>
          <option value="F">F (FDP)</option>
          <option value="S">S (Seminar)</option>
          <option value="W">W (Workshop)</option>
          <option value="WB">WB (Webinar)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col4">Nature (N/IN)</label>
        <select id="record-col4" class="form-select" required>
          <option value="">-- Select Nature --</option>
          <option value="N">N (National)</option>
          <option value="IN">IN (International)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col5">Tentative Month</label>
        <input type="text" id="record-col5" class="form-control" style="padding-left: 16px;" placeholder="e.g. September 2026" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col6">Faculty Coordinator(s)</label>
        <input type="text" id="record-col6" class="form-control" style="padding-left: 16px;" placeholder="e.g. Dr. E. Paul" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col7">IKS Aligned</label>
        <select id="record-col7" class="form-select" required>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col8">SDG Aligned</label>
        <select id="record-col8" class="form-select" required>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
    `;
  }
  if (sectionType === 'AAA Proposed Plan') {
    return `
      <div class="form-group">
        <label class="form-label" for="record-col1">S.No</label>
        <input type="text" id="record-col1" class="form-control" style="padding-left: 16px;" value="${nextSNo}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col2">Planned Activity</label>
        <input type="text" id="record-col2" class="form-control" style="padding-left: 16px;" placeholder="e.g. Guest Lecture" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col3">Tentative Month</label>
        <input type="text" id="record-col3" class="form-control" style="padding-left: 16px;" placeholder="e.g. December 2026" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="record-col4">Faculty Assigned</label>
        <input type="text" id="record-col4" class="form-control" style="padding-left: 16px;" placeholder="e.g. Dr. F. George" required>
      </div>
    `;
  }
  return '';
}

function renderCategoryDetailPage() {
  const categoryId = state.activeCategoryId;
  const category = state.involvementCategories.find(c => c.id === categoryId);
  if (!category) {
    switchSubView('staff-involvement');
    return;
  }
  
  document.getElementById('involvement-detail-title').innerText = category.name;
  
  // Populate meta-info values
  const deptSelect = document.getElementById('involvement-detail-dept');
  if (deptSelect && deptSelect.children.length === 0) {
    deptSelect.innerHTML = '<option value="">-- Select Department --</option>' + 
      state.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  }
  if (deptSelect) {
    deptSelect.value = category.department || '';
  }
  
  const coordInput = document.getElementById('involvement-detail-coordinator');
  if (coordInput) {
    coordInput.value = category.coordinator || '';
  }
  
  const shiftSelect = document.getElementById('involvement-detail-shift');
  if (shiftSelect) {
    shiftSelect.value = category.shift || 'Shift 1';
  }
  
  // Save meta info button
  const saveBtn = document.getElementById('save-involvement-meta-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const dept = deptSelect ? deptSelect.value : '';
      const coord = coordInput ? coordInput.value.trim() : '';
      const shift = shiftSelect ? shiftSelect.value : '';
      try {
        await fetchAPI(`/involvement/categories/${categoryId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: category.name,
            department: dept,
            coordinator: coord,
            shift: shift
          })
        });
        alert('Action Plan details saved successfully!');
        await loadInvolvementData();
        renderCategoryDetailPage();
      } catch (err) {
        console.error(err);
        alert('Failed to save Action Plan details');
      }
    };
  }
  
  const activeSection = state.activeInvolvementSection || 'Part A';
  const cardRecords = (state.involvementRecords || []).filter(r => r.category_id === categoryId && r.section_type === activeSection);
  document.getElementById('involvement-detail-subtitle').innerText = `Manage ${cardRecords.length} records under ${activeSection}.`;
  
  document.getElementById('involvement-detail-template-btn').onclick = () => downloadInvolvementTemplate(category.name);
  document.getElementById('involvement-detail-add-btn').onclick = () => openAddRecordModal(categoryId);
  
  const fileInput = document.getElementById('involvement-detail-import-file');
  fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
      handleInvolvementImport(categoryId, fileInput.files[0]);
    }
  };
  
  document.getElementById('involvement-detail-export-csv-btn').onclick = () => exportInvolvementExcel(categoryId);
  document.getElementById('involvement-detail-export-pdf-btn').onclick = () => exportInvolvementPDF(categoryId);
  
  const searchQuery = document.getElementById('involvement-detail-search').value.toLowerCase();
  
  const filtered = cardRecords.filter(r => {
    if (!searchQuery) return true;
    return (r.col1 || '').toLowerCase().includes(searchQuery) ||
           (r.col2 || '').toLowerCase().includes(searchQuery) ||
           (r.col3 || '').toLowerCase().includes(searchQuery) ||
           (r.col4 || '').toLowerCase().includes(searchQuery) ||
           (r.col5 || '').toLowerCase().includes(searchQuery) ||
           (r.col6 || '').toLowerCase().includes(searchQuery) ||
           (r.col7 || '').toLowerCase().includes(searchQuery) ||
           (r.col8 || '').toLowerCase().includes(searchQuery);
  });
  
  // Render Dynamic Table Headers
  const thead = document.getElementById('involvement-detail-table-head');
  let headerHtml = '';
  if (activeSection === 'Part A') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main); width: 80px;">S No</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Area of Responsibility</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Faculty In-charge</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  } else if (activeSection === 'Clubs') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main); width: 80px;">S.No</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Club Name</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Nature of Club</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Faculty Assigned</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  } else if (activeSection === 'Class Mentors') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Class</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Mentor</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  } else if (activeSection === 'Part B') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main); width: 80px;">S.No</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Activity</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Tentative Month</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Class / Target Group</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Faculty Coordinator</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  } else if (activeSection === 'Conferences') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main); width: 80px;">S.No</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Title / Theme</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Type</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Nature</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Tentative Month</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Faculty Coordinator(s)</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">IKS</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">SDG</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  } else if (activeSection === 'AAA Proposed Plan') {
    headerHtml = `
      <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10;">
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main); width: 80px;">S.No</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Planned Activity</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Tentative Month</th>
        <th style="text-align: left; padding: 12px; font-weight: 600; background: var(--bg-main);">Faculty Assigned</th>
        <th style="text-align: right; padding: 12px; font-weight: 600; background: var(--bg-main); width: 100px;">Actions</th>
      </tr>
    `;
  }
  thead.innerHTML = headerHtml;
  
  const tbody = document.getElementById('involvement-detail-table-body');
  tbody.innerHTML = '';
  
  if (filtered.length === 0) {
    const colCount = activeSection === 'Part A' ? 4 : activeSection === 'Clubs' ? 5 : activeSection === 'Class Mentors' ? 3 : activeSection === 'Part B' ? 6 : activeSection === 'Conferences' ? 9 : 5;
    tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding: 24px; color: var(--text-muted);">No records found. Import a file or add a record manually.</td></tr>`;
    return;
  }
  
  filtered.forEach(r => {
    const tr = document.createElement('tr');
    tr.id = `record-row-${r.id}`;
    tr.style.borderBottom = '1px solid var(--border)';
    
    let cellsHtml = '';
    if (activeSection === 'Part A') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted); white-space: pre-line;">${r.col3 || '-'}</td>
      `;
    } else if (activeSection === 'Clubs') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col3 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col4 || '-'}</td>
      `;
    } else if (activeSection === 'Class Mentors') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
      `;
    } else if (activeSection === 'Part B') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col3 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col4 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col5 || '-'}</td>
      `;
    } else if (activeSection === 'Conferences') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
        <td style="padding: 12px;"><span class="badge" style="background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border); font-size:11px;">${r.col3 || '-'}</span></td>
        <td style="padding: 12px;"><span class="badge" style="background: var(--primary-glow); color: var(--primary); font-size:11px;">${r.col4 || '-'}</span></td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col5 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col6 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col7 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col8 || '-'}</td>
      `;
    } else if (activeSection === 'AAA Proposed Plan') {
      cellsHtml = `
        <td style="padding: 12px; font-weight: 600; color: var(--text-main);">${r.col1 || '-'}</td>
        <td style="padding: 12px; font-weight: 500;">${r.col2 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col3 || '-'}</td>
        <td style="padding: 12px; color: var(--text-muted);">${r.col4 || '-'}</td>
      `;
    }
    
    tr.innerHTML = `
      ${cellsHtml}
      <td style="padding: 12px; text-align: right;">
        <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteInvolvementRecord(${r.id})" title="Delete record" style="padding: 4px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteInvolvementCategory(categoryId) {
  if (!confirm("Are you sure you want to delete this Category Card and all its records? This action is irreversible.")) return;
  try {
    await fetchAPI(`/involvement/categories/${categoryId}`, { method: 'DELETE' });
    await loadInvolvementData();
    renderStaffInvolvement();
  } catch(e) {
    console.error("Failed to delete category:", e);
  }
}

async function deleteInvolvementRecord(recordId) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  try {
    await fetchAPI(`/involvement/records/${recordId}`, { method: 'DELETE' });
    await loadInvolvementData();
    renderCategoryDetailPage();
  } catch(e) {
    console.error("Failed to delete record:", e);
  }
}

function downloadInvolvementTemplate(categoryName) {
  let csvContent = "";
  csvContent += "Department,\n";
  csvContent += "Head / Coordinator,\n";
  csvContent += "Shift,\n\n";
  
  csvContent += "PART - A: Faculty Responsibilities\n";
  csvContent += "S No,Area of Responsibility,Faculty In-charge\n\n";
  
  csvContent += "Clubs\n";
  csvContent += "S.No,Club Name,Nature of Club,Faculty Assigned\n\n";
  
  csvContent += "Class Mentors\n";
  csvContent += "Class,Mentor,Class,Mentor\n\n";
  
  csvContent += "PART - B: Academic & Co-curricular Activities\n";
  csvContent += "S.No,Activity,Tentative Month,Class / Target Group,Faculty Coordinator\n\n";
  
  csvContent += "Conferences/FDPs/Seminars/Workshops/Webinars\n";
  csvContent += "S.No,Title / Theme,Type (C/F/S/W/WB),Nature (N/IN),Tentative Month,Faculty Coordinator(s),IKS Aligned,SDG Aligned\n\n";
  
  csvContent += "Department Action Plan (as proposed in the AAA)\n";
  csvContent += "S.No,Planned Activity,Tentative Month,Faculty Assigned\n";

  const filename = `${categoryName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.csv`;
  downloadCSV(csvContent, filename);
}

function openAddCategoryModal() {
  document.getElementById('category-name').value = '';
  document.getElementById('involvement-category-modal').classList.add('open');
}

function closeAddCategoryModal() {
  document.getElementById('involvement-category-modal').classList.remove('open');
}

function openAddRecordModal(categoryId) {
  document.getElementById('record-category-id').value = categoryId;
  document.getElementById('record-edit-id').value = '';
  
  const container = document.getElementById('involvement-record-dynamic-fields');
  if (container) {
    const cardRecords = (state.involvementRecords || []).filter(r => r.category_id === categoryId);
    container.innerHTML = generateRecordFieldsHTML(state.activeInvolvementSection, cardRecords);
  }
  
  document.getElementById('record-modal-title').innerText = `Add Record to ${state.activeInvolvementSection}`;
  document.getElementById('involvement-record-modal').classList.add('open');
}

function closeAddRecordModal() {
  document.getElementById('involvement-record-modal').classList.remove('open');
}

function triggerImportInvolvement(categoryId) {
  const fileInput = document.getElementById(`import-file-${categoryId}`);
  if (fileInput && fileInput.files.length > 0) {
    handleInvolvementImport(categoryId, fileInput.files[0]);
  }
}

async function parseFileToRows(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  const rows = [];
  
  if (extension === 'csv') {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    lines.forEach(line => {
      if (!line.trim()) return;
      rows.push(parseCsvLine(line));
    });
  } else if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    const html = result.value;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const trs = tempDiv.querySelectorAll('tr');
    trs.forEach(tr => {
      const cols = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
      rows.push(cols);
    });
    const ps = tempDiv.querySelectorAll('p');
    ps.forEach(p => {
      const text = p.innerText.trim();
      if (text.toLowerCase().includes("department:") || text.toLowerCase().includes("coordinator:") || text.toLowerCase().includes("shift:")) {
        const parts = text.split(":");
        rows.push([parts[0], parts.slice(1).join(":")]);
      }
    });
  } else if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items;
      
      const rowsMap = [];
      items.forEach(item => {
        const str = item.str.trim();
        if (!str) return;
        const x = item.transform[4];
        const y = item.transform[5];
        
        let foundRow = rowsMap.find(r => Math.abs(r.y - y) <= 6);
        if (!foundRow) {
          foundRow = { y: y, items: [] };
          rowsMap.push(foundRow);
        }
        foundRow.items.push({ x: x, str: str });
      });
      
      rowsMap.sort((a, b) => b.y - a.y);
      
      rowsMap.forEach(row => {
        row.items.sort((a, b) => a.x - b.x);
        
        const cells = [];
        let currentCell = null;
        row.items.forEach(item => {
          if (!currentCell) {
            currentCell = { ...item };
          } else if (item.x - (currentCell.x + currentCell.str.length * 4) <= 12) {
            currentCell.str += " " + item.str;
          } else {
            cells.push(currentCell.str.trim());
            currentCell = { ...item };
          }
        });
        if (currentCell) {
          cells.push(currentCell.str.trim());
        }
        rows.push(cells);
      });
    }
  }
  return rows;
}

async function handleInvolvementImport(categoryId, file) {
  try {
    const rows = await parseFileToRows(file);
    if (rows.length === 0) {
      alert("Unsupported file format or empty document. Please upload CSV, Word (.docx), or PDF.");
      return;
    }
    const parsedRecords = await parseRowsToInvolvement(rows, categoryId);
    await uploadInvolvementRecords(categoryId, parsedRecords);
  } catch (err) {
    console.error("Failed to parse file:", err);
    alert("Error parsing file: " + err.message);
  }
}

async function handleBulkInvolvementImport(files) {
  if (!files || files.length === 0) return;
  
  let successCount = 0;
  let errorCount = 0;
  
  const container = document.getElementById('involvement-cards-container');
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
      <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <h4>Bulk Importing ${files.length} Files...</h4>
      <p id="bulk-import-status">Processing files, please wait.</p>
    </div>
  `;
  
  if (!document.getElementById('involvement-loader-style')) {
    const style = document.createElement('style');
    style.id = 'involvement-loader-style';
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    document.getElementById('bulk-import-status').innerText = `Processing file ${i+1} of ${files.length}: ${file.name}`;
    
    try {
      const rows = await parseFileToRows(file);
      if (rows.length === 0) {
        errorCount++;
        continue;
      }
      
      let metaDept = "";
      let metaCoord = "";
      let metaShift = "";
      
      for (let r of rows) {
        const row = r.map(c => (c || '').trim());
        if (row.length === 0 || row.every(c => c === '')) continue;
        const firstCellLower = row[0].toLowerCase();
        
        if (firstCellLower.startsWith("department")) {
          metaDept = row[1] || row.slice(1).join(" ");
        } else if (firstCellLower.startsWith("head / coordinator") || firstCellLower.startsWith("head/coordinator") || firstCellLower.startsWith("coordinator")) {
          metaCoord = row[1] || row.slice(1).join(" ");
        } else if (firstCellLower.startsWith("shift")) {
          metaShift = row[1] || row.slice(1).join(" ");
          if (metaShift.includes("1") || metaShift.toLowerCase().includes("i") && !metaShift.toLowerCase().includes("ii")) {
            metaShift = "Shift 1";
          } else if (metaShift.includes("2") || metaShift.toLowerCase().includes("ii")) {
            metaShift = "Shift 2";
          } else if (metaShift.toLowerCase().includes("combined")) {
            metaShift = "Combined Department";
          }
        }
      }
      
      const defaultName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const deptName = metaDept || defaultName;
      const shiftName = metaShift || "Shift 1";
      const cardName = `${deptName} (${shiftName}) Action Plan 2026-2027`;
      
      let category = state.involvementCategories.find(c => c.name.toLowerCase() === cardName.toLowerCase());
      let categoryId = '';
      
      if (!category) {
        const newCat = await fetchAPI('/involvement/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: cardName,
            department: deptName,
            coordinator: metaCoord || "Mr. A. Charles",
            shift: shiftName
          })
        });
        categoryId = newCat.id;
        state.involvementCategories = await fetchAPI('/involvement/categories');
      } else {
        categoryId = category.id;
        if (metaCoord) {
          await fetchAPI(`/involvement/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: category.name,
              department: deptName,
              coordinator: metaCoord,
              shift: shiftName
            })
          });
        }
      }
      
      const parsedRecords = await parseRowsToInvolvement(rows, categoryId);
      const validRecords = parsedRecords.filter(r => r.col1 && r.col2);
      if (validRecords.length > 0) {
        await fetchAPI('/involvement/records/bulk', {
          method: 'POST',
          body: JSON.stringify({ category_id: categoryId, records: validRecords, clear_existing: true })
        });
        successCount++;
      } else {
        errorCount++;
      }
      
    } catch (err) {
      console.error(`Failed to import bulk plan for ${file.name}:`, err);
      errorCount++;
    }
  }
  
  alert(`Bulk import completed!\nSuccessfully imported: ${successCount} plans.\nFailed or skipped: ${errorCount} plans.`);
  
  await loadInvolvementData();
  renderStaffInvolvement();
}

function goToPlanSection(categoryId, sectionName, recordId) {
  openCategoryDetailPage(categoryId);
  setInvolvementSection(sectionName);
  
  // Highlight and scroll to the specific row after rendering
  setTimeout(() => {
    const searchInput = document.getElementById('involvement-detail-search');
    if (searchInput) {
      searchInput.value = ''; // Clear detail search query
      renderCategoryDetailPage();
    }
    
    const targetRow = document.getElementById(`record-row-${recordId}`);
    if (targetRow) {
      targetRow.style.outline = '2px solid var(--primary)';
      targetRow.style.background = '#faf5ff';
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        targetRow.style.transition = 'all 1s ease';
        targetRow.style.outline = 'none';
        targetRow.style.background = '';
      }, 3000);
    }
  }, 200);
}

async function parseRowsToInvolvement(rows, categoryId) {
  let metaDept = "";
  let metaCoord = "";
  let metaShift = "";
  let parsedRecords = [];
  
  let currentSection = "Part A";
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => (c || '').trim());
    if (row.length === 0 || row.every(c => c === '')) continue;
    
    const rowStr = row.join(" ");
    const firstCellLower = row[0].toLowerCase();
    
    // 1. Detect Meta Information
    if (firstCellLower.startsWith("department")) {
      metaDept = row[1] || row.slice(1).join(" ");
      continue;
    }
    if (firstCellLower.startsWith("head / coordinator") || firstCellLower.startsWith("head/coordinator") || firstCellLower.startsWith("coordinator")) {
      metaCoord = row[1] || row.slice(1).join(" ");
      continue;
    }
    if (firstCellLower.startsWith("shift")) {
      metaShift = row[1] || row.slice(1).join(" ");
      if (metaShift.includes("1") || metaShift.toLowerCase().includes("i") && !metaShift.toLowerCase().includes("ii")) {
        metaShift = "Shift 1";
      } else if (metaShift.includes("2") || metaShift.toLowerCase().includes("ii")) {
        metaShift = "Shift 2";
      } else if (metaShift.toLowerCase().includes("combined")) {
        metaShift = "Combined Department";
      }
      continue;
    }
    
    // 2. Detect Sections
    if (rowStr.toLowerCase().includes("part - a") || rowStr.toLowerCase().includes("part – a") || rowStr.toLowerCase().includes("faculty responsibilities")) {
      currentSection = "Part A";
      continue;
    }
    if (rowStr.toLowerCase().includes("clubs")) {
      currentSection = "Clubs";
      continue;
    }
    if (rowStr.toLowerCase().includes("class mentors") || rowStr.toLowerCase().includes("class mentor")) {
      currentSection = "Class Mentors";
      continue;
    }
    if (rowStr.toLowerCase().includes("part - b") || rowStr.toLowerCase().includes("part – b") || rowStr.toLowerCase().includes("academic & co-curricular") || rowStr.toLowerCase().includes("academic activities")) {
      currentSection = "Part B";
      continue;
    }
    if (rowStr.toLowerCase().includes("conferences") || rowStr.toLowerCase().includes("fdps") || rowStr.toLowerCase().includes("seminars") || rowStr.toLowerCase().includes("workshops") || rowStr.toLowerCase().includes("webinars")) {
      currentSection = "Conferences";
      continue;
    }
    if (rowStr.toLowerCase().includes("department action plan (as proposed") || rowStr.toLowerCase().includes("proposed in the aaa")) {
      currentSection = "AAA Proposed Plan";
      continue;
    }
    
    // 3. Skip header rows
    if (currentSection === "Part A") {
      if (rowStr.toLowerCase().includes("area of responsibility") || rowStr.toLowerCase().includes("faculty in-charge")) continue;
    } else if (currentSection === "Clubs") {
      if (rowStr.toLowerCase().includes("club name") || rowStr.toLowerCase().includes("faculty assigned")) continue;
    } else if (currentSection === "Class Mentors") {
      if (rowStr.toLowerCase().includes("class") || rowStr.toLowerCase().includes("mentor")) continue;
    } else if (currentSection === "Part B") {
      if (rowStr.toLowerCase().includes("activity") || rowStr.toLowerCase().includes("faculty coordinator")) continue;
    } else if (currentSection === "Conferences") {
      if (rowStr.toLowerCase().includes("title") || rowStr.toLowerCase().includes("iks aligned") || rowStr.toLowerCase().includes("sdg aligned")) continue;
    } else if (currentSection === "AAA Proposed Plan") {
      if (rowStr.toLowerCase().includes("planned activity") || rowStr.toLowerCase().includes("faculty assigned")) continue;
    }
    
    // 4. Extract data based on current section
    if (currentSection === "Part A") {
      if (row.length >= 2) {
        parsedRecords.push({
          section_type: "Part A",
          col1: row[0],
          col2: row[1],
          col3: row[2] || ""
        });
      }
    } else if (currentSection === "Clubs") {
      if (row.length >= 2) {
        parsedRecords.push({
          section_type: "Clubs",
          col1: row[0],
          col2: row[1],
          col3: row[2] || "",
          col4: row[3] || ""
        });
      }
    } else if (currentSection === "Class Mentors") {
      if (row.length >= 4) {
        const class1 = row[0];
        const mentor1 = row[1];
        const class2 = row[2];
        const mentor2 = row[3];
        
        if (class1 && class1.toLowerCase() !== "class" && class1.toLowerCase() !== "-") {
          parsedRecords.push({
            section_type: "Class Mentors",
            col1: class1,
            col2: mentor1 || ""
          });
        }
        if (class2 && class2.toLowerCase() !== "class" && class2.toLowerCase() !== "-") {
          parsedRecords.push({
            section_type: "Class Mentors",
            col1: class2,
            col2: mentor2 || ""
          });
        }
      } else if (row.length >= 2) {
        parsedRecords.push({
          section_type: "Class Mentors",
          col1: row[0],
          col2: row[1] || ""
        });
      }
    } else if (currentSection === "Part B") {
      if (row.length >= 2) {
        parsedRecords.push({
          section_type: "Part B",
          col1: row[0],
          col2: row[1],
          col3: row[2] || "",
          col4: row[3] || "",
          col5: row[4] || ""
        });
      }
    } else if (currentSection === "Conferences") {
      if (row.length >= 2) {
        parsedRecords.push({
          section_type: "Conferences",
          col1: row[0],
          col2: row[1],
          col3: row[2] || "",
          col4: row[3] || "",
          col5: row[4] || "",
          col6: row[5] || "",
          col7: row[6] || "",
          col8: row[7] || ""
        });
      }
    } else if (currentSection === "AAA Proposed Plan") {
      if (row.length >= 2) {
        parsedRecords.push({
          section_type: "AAA Proposed Plan",
          col1: row[0],
          col2: row[1],
          col3: row[2] || "",
          col4: row[3] || ""
        });
      }
    }
  }
  
  const category = state.involvementCategories.find(c => c.id === categoryId);
  if (category && (metaDept || metaCoord || metaShift)) {
    await fetchAPI(`/involvement/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: category.name,
        department: metaDept || category.department || '',
        coordinator: metaCoord || category.coordinator || '',
        shift: metaShift || category.shift || ''
      })
    });
  }
  
  return parsedRecords;
}

async function uploadInvolvementRecords(categoryId, records) {
  const validRecords = records.filter(r => {
    return r.col1 && r.col2;
  });
  
  if (validRecords.length === 0) {
    alert("No valid records found in the imported file. Please check that the file layout matches the expected sections.");
    return;
  }
  
  try {
    const res = await fetchAPI('/involvement/records/bulk', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, records: validRecords, clear_existing: true })
    });
    alert(`Successfully imported ${res.count} records!`);
    await loadInvolvementData();
    renderCategoryDetailPage();
  } catch (err) {
    console.error("Bulk upload failed:", err);
    alert("Import failed: " + err.message);
  }
}

function parseCsvLine(text) {
  const result = [];
  let curVal = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(curVal.trim());
      curVal = '';
    } else {
      curVal += c;
    }
  }
  result.push(curVal.trim());
  return result;
}

function exportInvolvementExcel(categoryId) {
  const category = state.involvementCategories.find(c => c.id === categoryId);
  if (!category) return;
  
  const searchInput = document.getElementById('involvement-detail-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const section = state.activeInvolvementSection;
  const cardRecords = state.involvementRecords.filter(r => r.category_id === categoryId && r.section_type === section);
  
  const filtered = cardRecords.filter(r => {
    if (!query) return true;
    return (r.col1 || '').toLowerCase().includes(query) ||
           (r.col2 || '').toLowerCase().includes(query) ||
           (r.col3 || '').toLowerCase().includes(query) ||
           (r.col4 || '').toLowerCase().includes(query) ||
           (r.col5 || '').toLowerCase().includes(query) ||
           (r.col6 || '').toLowerCase().includes(query) ||
           (r.col7 || '').toLowerCase().includes(query) ||
           (r.col8 || '').toLowerCase().includes(query);
  });
  
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '';
    const stringified = String(str).replace(/"/g, '""');
    if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
      return `"${stringified}"`;
    }
    return stringified;
  };
  
  let headers = [];
  if (section === 'Part A') {
    headers = ['S No', 'Area of Responsibility', 'Faculty In-charge'];
  } else if (section === 'Clubs') {
    headers = ['S.No', 'Club Name', 'Nature of Club', 'Faculty Assigned'];
  } else if (section === 'Class Mentors') {
    headers = ['Class', 'Mentor'];
  } else if (section === 'Part B') {
    headers = ['S.No', 'Activity', 'Tentative Month', 'Class / Target Group', 'Faculty Coordinator'];
  } else if (section === 'Conferences') {
    headers = ['S.No', 'Title / Theme', 'Type (C/F/S/W/WB)', 'Nature (N/IN)', 'Tentative Month', 'Faculty Coordinator(s)', 'IKS Aligned', 'SDG Aligned'];
  } else if (section === 'AAA Proposed Plan') {
    headers = ['S.No', 'Planned Activity', 'Tentative Month', 'Faculty Assigned'];
  }

  const csvRows = [
    [escapeCsv('Department:'), escapeCsv(category.department || '')],
    [escapeCsv('Head / Coordinator:'), escapeCsv(category.coordinator || '')],
    [escapeCsv('Shift:'), escapeCsv(category.shift || '')],
    [],
    [escapeCsv(`Section: ${section}`)],
    [],
    headers.map(escapeCsv)
  ];
  
  filtered.forEach(r => {
    const rowData = [];
    if (section === 'Part A') {
      rowData.push(r.col1, r.col2, r.col3);
    } else if (section === 'Clubs') {
      rowData.push(r.col1, r.col2, r.col3, r.col4);
    } else if (section === 'Class Mentors') {
      rowData.push(r.col1, r.col2);
    } else if (section === 'Part B') {
      rowData.push(r.col1, r.col2, r.col3, r.col4, r.col5);
    } else if (section === 'Conferences') {
      rowData.push(r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8);
    } else if (section === 'AAA Proposed Plan') {
      rowData.push(r.col1, r.col2, r.col3, r.col4);
    }
    csvRows.push(rowData.map(escapeCsv));
  });
  
  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const filename = `${category.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${section.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
  downloadCSV(csvContent, filename);
}

function exportInvolvementPDF(categoryId) {
  const category = state.involvementCategories.find(c => c.id === categoryId);
  if (!category) return;
  
  const searchInput = document.getElementById('involvement-detail-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  
  const section = state.activeInvolvementSection;
  const cardRecords = state.involvementRecords.filter(r => r.category_id === categoryId && r.section_type === section);
  
  const filtered = cardRecords.filter(r => {
    if (!query) return true;
    return (r.col1 || '').toLowerCase().includes(query) ||
           (r.col2 || '').toLowerCase().includes(query) ||
           (r.col3 || '').toLowerCase().includes(query) ||
           (r.col4 || '').toLowerCase().includes(query) ||
           (r.col5 || '').toLowerCase().includes(query) ||
           (r.col6 || '').toLowerCase().includes(query) ||
           (r.col7 || '').toLowerCase().includes(query) ||
           (r.col8 || '').toLowerCase().includes(query);
  });
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002", 105, 15, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("Internal Quality Assurance Cell (IQAC)", 105, 21, { align: "center" });
    doc.text(`Department Action Plan: 2026-2027`, 105, 27, { align: "center" });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 31, 196, 31);
    
    // Meta info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Department:", 14, 37);
    doc.setFont("helvetica", "normal");
    doc.text(category.department || "____________________", 42, 37);
    
    doc.setFont("helvetica", "bold");
    doc.text("Head / Coordinator:", 14, 43);
    doc.setFont("helvetica", "normal");
    doc.text(category.coordinator || "____________________", 52, 43);
    
    doc.setFont("helvetica", "bold");
    doc.text("Shift (I / II):", 14, 49);
    doc.setFont("helvetica", "normal");
    doc.text(category.shift || "____________________", 38, 49);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text(section.toUpperCase(), 14, 57);
    
    let tableHeaders = [];
    let columnStyles = {};
    
    if (section === 'Part A') {
      tableHeaders = [['S No', 'Area of Responsibility', 'Faculty In-charge']];
      columnStyles = {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 80 }
      };
    } else if (section === 'Clubs') {
      tableHeaders = [['S.No', 'Club Name', 'Nature of Club', 'Faculty Assigned']];
      columnStyles = {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 50 },
        3: { cellWidth: 50 }
      };
    } else if (section === 'Class Mentors') {
      tableHeaders = [['Class', 'Mentor']];
      columnStyles = {
        0: { cellWidth: 90 },
        1: { cellWidth: 90 }
      };
    } else if (section === 'Part B') {
      tableHeaders = [['S.No', 'Activity', 'Tentative Month', 'Class / Target Group', 'Faculty Coordinator']];
      columnStyles = {
        0: { cellWidth: 15 },
        1: { cellWidth: 65 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      };
    } else if (section === 'Conferences') {
      tableHeaders = [['S.No', 'Title / Theme', 'Type', 'Nature', 'Tentative Month', 'Coordinator(s)', 'IKS', 'SDG']];
      columnStyles = {
        0: { cellWidth: 12 },
        1: { cellWidth: 50 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 },
        6: { cellWidth: 12 },
        7: { cellWidth: 12 }
      };
    } else if (section === 'AAA Proposed Plan') {
      tableHeaders = [['S.No', 'Planned Activity', 'Tentative Month', 'Faculty Assigned']];
      columnStyles = {
        0: { cellWidth: 20 },
        1: { cellWidth: 70 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 }
      };
    }
    
    const tableBody = filtered.map(r => {
      if (section === 'Part A') return [r.col1, r.col2, r.col3];
      if (section === 'Clubs') return [r.col1, r.col2, r.col3, r.col4];
      if (section === 'Class Mentors') return [r.col1, r.col2];
      if (section === 'Part B') return [r.col1, r.col2, r.col3, r.col4, r.col5];
      if (section === 'Conferences') return [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8];
      if (section === 'AAA Proposed Plan') return [r.col1, r.col2, r.col3, r.col4];
      return [];
    });
    
    doc.autoTable({
      startY: 61,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: [50, 50, 50] },
      columnStyles: columnStyles,
      margin: { left: 14, right: 14 }
    });
    
    const filename = `${category.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${section.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pdf`;
    doc.save(filename);
  } catch(err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF: " + err.message);
  }
}

function getRecordPlainDetails(r) {
  let activity = r.col2 || '';
  let details = '';
  const val = (v) => v || '-';
  
  if (r.section_type === 'Part A') {
    activity = r.col2 || '';
    details = `S.No: ${val(r.col1)}\nArea of Responsibility: ${val(r.col2)}\nFaculty In-charge: ${val(r.col3)}`;
  } else if (r.section_type === 'Clubs') {
    activity = r.col2 || '';
    details = `S.No: ${val(r.col1)}\nClub Name: ${val(r.col2)}\nNature of Club: ${val(r.col3)}\nFaculty Assigned: ${val(r.col4)}`;
  } else if (r.section_type === 'Class Mentors') {
    activity = `Class Mentor - ${val(r.col1)}`;
    details = `Class: ${val(r.col1)}\nMentor: ${val(r.col2)}`;
  } else if (r.section_type === 'Part B') {
    activity = r.col2 || '';
    details = `S.No: ${val(r.col1)}\nActivity: ${val(r.col2)}\nTentative Month: ${val(r.col3)}\nClass / Target Group: ${val(r.col4)}\nFaculty Coordinator: ${val(r.col5)}`;
  } else if (r.section_type === 'Conferences') {
    activity = r.col2 || '';
    details = `S.No: ${val(r.col1)}\nTitle / Theme: ${val(r.col2)}\nType: ${val(r.col3)}\nNature: ${val(r.col4)}\nTentative Month: ${val(r.col5)}\nFaculty Coordinator(s): ${val(r.col6)}\nIKS Aligned: ${val(r.col7)}\nSDG Aligned: ${val(r.col8)}`;
  } else if (r.section_type === 'AAA Proposed Plan') {
    activity = r.col2 || '';
    details = `S.No: ${val(r.col1)}\nPlanned Activity: ${val(r.col2)}\nTentative Month: ${val(r.col3)}\nFaculty Assigned: ${val(r.col4)}`;
  }
  return { activity, details };
}

async function exportAllInvolvementsExcel() {
  try {
    const searchVal = document.getElementById('involvement-global-search') ? document.getElementById('involvement-global-search').value.toLowerCase().trim() : '';
    const deptFilter = document.getElementById('involvement-global-dept') ? document.getElementById('involvement-global-dept').value : 'all';
    const shiftFilter = document.getElementById('involvement-global-shift') ? document.getElementById('involvement-global-shift').value : 'all';
    
    let filteredCats = [...(state.involvementCategories || [])];
    if (deptFilter !== 'all') {
      filteredCats = filteredCats.filter(c => c.department === deptFilter);
    }
    if (shiftFilter !== 'all') {
      filteredCats = filteredCats.filter(c => c.shift === shiftFilter);
    }

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };

    let csvRows = [];
    if (searchVal) {
      // Export search results format (5 columns)
      csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
      csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
      csvRows.push([escapeCsv(`Staff Involvement Search Results for: "${searchVal}"`)]);
      csvRows.push([escapeCsv(`Filter Department: ${deptFilter} | Filter Shift: ${shiftFilter}`)]);
      csvRows.push([]);
      csvRows.push([
        escapeCsv('Department'),
        escapeCsv('Shift'),
        escapeCsv('Section'),
        escapeCsv('Activity / Role'),
        escapeCsv('Details')
      ]);

      for (const cat of filteredCats) {
        let records = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
        records = records.filter(r => {
          const colsText = [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8]
            .map(v => (v || '').toLowerCase())
            .join(' ');
          return colsText.includes(searchVal);
        });

        records.forEach(r => {
          const detailsObj = getRecordPlainDetails(r);
          csvRows.push([
            escapeCsv(cat.department || cat.name),
            escapeCsv(cat.shift || 'Shift 1'),
            escapeCsv(r.section_type),
            escapeCsv(detailsObj.activity),
            escapeCsv(detailsObj.details)
          ]);
        });
      }
    } else {
      // Export all detailed records (12 columns)
      csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
      csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
      csvRows.push([escapeCsv("Department Action Plan: Staff Involvements Report (All Records)")]);
      csvRows.push([escapeCsv(`Filter Department: ${deptFilter} | Filter Shift: ${shiftFilter}`)]);
      csvRows.push([]);
      csvRows.push([
        escapeCsv('Department'),
        escapeCsv('Shift'),
        escapeCsv('Head / Coordinator'),
        escapeCsv('Section Type'),
        escapeCsv('Col 1 (S.No / Class)'),
        escapeCsv('Col 2 (Area / Title)'),
        escapeCsv('Col 3 (Details / Nature)'),
        escapeCsv('Col 4 (Faculty / Month)'),
        escapeCsv('Col 5 (Target Group / Coordinator)'),
        escapeCsv('Col 6 (Faculty / Coordinator)'),
        escapeCsv('Col 7 (IKS Aligned)'),
        escapeCsv('Col 8 (SDG Aligned)')
      ]);

      for (const cat of filteredCats) {
        const records = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
        records.forEach(r => {
          csvRows.push([
            escapeCsv(cat.department || cat.name),
            escapeCsv(cat.shift || 'Shift 1'),
            escapeCsv(cat.coordinator || '-'),
            escapeCsv(r.section_type),
            escapeCsv(r.col1),
            escapeCsv(r.col2),
            escapeCsv(r.col3),
            escapeCsv(r.col4),
            escapeCsv(r.col5),
            escapeCsv(r.col6),
            escapeCsv(r.col7),
            escapeCsv(r.col8)
          ]);
        });
      }
    }

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const suffix = searchVal ? 'search_results' : 'all_details';
    const filename = `staff_involvement_${suffix}_${deptFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${shiftFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
    downloadCSV(csvContent, filename);
  } catch (err) {
    console.error("CSV Export failed:", err);
    alert("Failed to export Excel: " + err.message);
  }
}

async function exportAllInvolvementsPDF() {
  try {
    const searchVal = document.getElementById('involvement-global-search') ? document.getElementById('involvement-global-search').value.toLowerCase().trim() : '';
    const deptFilter = document.getElementById('involvement-global-dept') ? document.getElementById('involvement-global-dept').value : 'all';
    const shiftFilter = document.getElementById('involvement-global-shift') ? document.getElementById('involvement-global-shift').value : 'all';
    
    let filteredCats = [...(state.involvementCategories || [])];
    if (deptFilter !== 'all') {
      filteredCats = filteredCats.filter(c => c.department === deptFilter);
    }
    if (shiftFilter !== 'all') {
      filteredCats = filteredCats.filter(c => c.shift === shiftFilter);
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002", 105, 15, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("Internal Quality Assurance Cell (IQAC)", 105, 21, { align: "center" });
    
    const titleText = searchVal 
      ? `Staff Involvement: Global Search Results ("${searchVal}")`
      : `Staff Involvement: Detailed Action Plan Records`;
    doc.text(titleText, 105, 27, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 31, 196, 31);
    
    const tableHeaders = [['Department', 'Shift', 'Section', 'Activity / Role', 'Details']];
    const tableBody = [];

    for (const cat of filteredCats) {
      let records = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
      
      if (searchVal) {
        records = records.filter(r => {
          const colsText = [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8]
            .map(v => (v || '').toLowerCase())
            .join(' ');
          return colsText.includes(searchVal);
        });
      }

      records.forEach(r => {
        const detailsObj = getRecordPlainDetails(r);
        tableBody.push([
          cat.department || cat.name,
          cat.shift || 'Shift 1',
          r.section_type,
          detailsObj.activity,
          detailsObj.details
        ]);
      });
    }

    if (tableBody.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No records found matching the criteria.", 14, 40);
    } else {
      doc.autoTable({
        startY: 36,
        head: tableHeaders,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: [50, 50, 50] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 62 }
        },
        margin: { left: 14, right: 14 }
      });
    }
    
    const suffix = searchVal ? 'search_results' : 'all_details';
    const filename = `staff_involvement_${suffix}_${deptFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${shiftFilter.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    doc.save(filename);
  } catch(err) {
    console.error("PDF Export failed:", err);
    alert("Failed to export PDF: " + err.message);
  }
}

// Attach Form Submit Listeners for Involvement
setTimeout(() => {
  const catForm = document.getElementById('involvement-category-form');
  if (catForm) {
    catForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('category-name').value.trim();
      if (!name) return;
      
      const id = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + Date.now();
      try {
        await fetchAPI('/involvement/categories', {
          method: 'POST',
          body: JSON.stringify({ id, name })
        });
        closeAddCategoryModal();
        await loadInvolvementData();
        renderStaffInvolvement();
      } catch(err) {
        console.error("Failed to create involvement category:", err);
      }
    });
  }

  const recForm = document.getElementById('involvement-record-form');
  if (recForm) {
    recForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const category_id = document.getElementById('record-category-id').value;
      const section_type = state.activeInvolvementSection;
      
      const col1 = document.getElementById('record-col1') ? document.getElementById('record-col1').value.trim() : '';
      const col2 = document.getElementById('record-col2') ? document.getElementById('record-col2').value.trim() : '';
      const col3 = document.getElementById('record-col3') ? document.getElementById('record-col3').value.trim() : '';
      const col4 = document.getElementById('record-col4') ? document.getElementById('record-col4').value.trim() : '';
      const col5 = document.getElementById('record-col5') ? document.getElementById('record-col5').value.trim() : '';
      const col6 = document.getElementById('record-col6') ? document.getElementById('record-col6').value.trim() : '';
      const col7 = document.getElementById('record-col7') ? document.getElementById('record-col7').value.trim() : '';
      const col8 = document.getElementById('record-col8') ? document.getElementById('record-col8').value.trim() : '';
      
      if (!category_id || !section_type || !col1 || !col2) {
        alert("At least the first two columns of data are required.");
        return;
      }
      
      try {
        await fetchAPI('/involvement/records', {
          method: 'POST',
          body: JSON.stringify({ category_id, section_type, col1, col2, col3, col4, col5, col6, col7, col8 })
        });
        closeAddRecordModal();
        await loadInvolvementData();
        renderCategoryDetailPage();
      } catch(err) {
        console.error("Failed to add involvement record:", err);
      }
    });
  }
}, 500);

// ================= PUBLIC STATUS DASHBOARD =================

async function renderPublicStatusDashboard() {
  await loadEvents();
  const visibleEvents = state.events.filter(e => e.is_visible_public !== 0);
  
  const selectEl = document.getElementById('public-event-select');
  if (selectEl) {
    selectEl.innerHTML = '<option value="">-- Select Event Activity --</option>' +
      visibleEvents.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    
    if (state.publicSelectedEventId) {
      selectEl.value = state.publicSelectedEventId;
    } else if (visibleEvents.length > 0) {
      state.publicSelectedEventId = visibleEvents[0].id;
      selectEl.value = state.publicSelectedEventId;
    }
  }
  
  if (state.publicSelectedEventId) {
    renderPublicEventDetail(state.publicSelectedEventId);
  }
}

function onPublicEventSelect(eventId) {
  state.publicSelectedEventId = eventId;
  renderPublicEventDetail(eventId);
}

function onPublicStatusFilterChange() {
  if (state.publicSelectedEventId) {
    renderPublicEventDetail(state.publicSelectedEventId);
  }
}

function renderPublicEventsList() {}
function selectPublicEvent(eventId) {
  onPublicEventSelect(eventId);
}

async function renderPublicEventDetail(eventId) {
  const panel = document.getElementById('public-detail-panel');
  if (!panel) return;
  
  if (!eventId) {
    panel.innerHTML = `
      <div style="text-align: center; margin: auto; padding: 40px; color: var(--text-muted);">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent); margin-bottom: 16px; opacity: 0.7;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
        <h3>No Activity Selected</h3>
        <p>Please choose an activity from the dropdown menu to view details.</p>
      </div>
    `;
    return;
  }
  
  panel.innerHTML = `<div style="text-align:center; margin: auto; padding: 40px; color: var(--text-muted);">Loading checklist details...</div>`;
  
  const evt = state.events.find(e => e.id === eventId);
  if (!evt) {
    panel.innerHTML = `<div style="text-align:center; margin: auto; padding: 40px; color: var(--text-muted);">Activity not found.</div>`;
    return;
  }
  
  try {
    const checklists = await fetchAPI(`/submissions/${eventId}`);
    const stats = getEventStats(evt, checklists);
    const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
    
    const statusFilter = document.getElementById('public-status-filter') ? document.getElementById('public-status-filter').value : 'all';
    
    let targetDepts = state.departments.filter(dept => scope.includes(dept.shift));
    
    targetDepts = targetDepts.filter(dept => {
      const chk = checklists[dept.id] || { status: 'pending' };
      if (statusFilter === 'all') return true;
      if (statusFilter === 'received') return chk.status === 'received';
      if (statusFilter === 'remarks') return chk.status === 'remarks';
      if (statusFilter === 'pending') return chk.status === 'pending' || !chk.status;
      return true;
    });

    targetDepts.sort((a, b) => {
      const shiftOrder = { 'Shift 1': 1, 'Shift 2': 2, 'Combined Department': 3 };
      const orderA = shiftOrder[a.shift] || 99;
      const orderB = shiftOrder[b.shift] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
      
    let rowsHtml = '';
    targetDepts.forEach(dept => {
      const chk = checklists[dept.id] || { status: 'pending', receivedTime: null, remarks: '' };
      
      let statusBadge = '';
      if (chk.status === 'received') {
        const isLate = isSubmissionLate(chk.receivedTime, evt.deadline);
        statusBadge = isLate 
          ? `<span class="badge badge-received" style="background-color: #fee2e2; color: #ef4444; border: 1px solid #fca5a5;">Received (Late)</span>` 
          : `<span class="badge badge-received" style="background-color: #d1fae5; color: #10b981; border: 1px solid #6ee7b7;">Received</span>`;
      } else if (chk.status === 'remarks') {
        statusBadge = `<span class="badge badge-remarks" style="background-color: #fef3c7; color: #d97706; border: 1px solid #fcd34d;">Needs Correction</span>`;
      } else {
        statusBadge = `<span class="badge badge-pending" style="background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;">Pending</span>`;
      }
      
      const timeText = chk.receivedTime ? formatSubmissionTime(chk.receivedTime) : '-';
      
      rowsHtml += `
        <tr>
          <td style="font-weight: 500;">${dept.name}</td>
          <td><span class="badge" style="background-color: var(--secondary); color: var(--text-main); font-weight: 500;">${dept.shift}</span></td>
          <td>${statusBadge}</td>
          <td style="font-size: 13px; color: var(--text-muted);">${timeText}</td>
        </tr>
      `;
    });
    
    panel.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">${evt.title}</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">${evt.description}</p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: var(--text-muted); background: var(--bg-main); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <div><strong>Created:</strong> ${new Date(evt.created_at).toLocaleDateString()}</div>
            <div><strong>Deadline:</strong> ${new Date(evt.deadline).toLocaleString()}</div>
            <div><strong>Scope:</strong> ${scope}</div>
          </div>
        </div>
        
        <div class="glass-panel" style="padding: 16px; border-radius: 12px; margin-bottom: 20px; background: rgba(109, 40, 217, 0.03); border: 1px solid rgba(109, 40, 217, 0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; font-size: 14px; color: var(--primary);">Activity Submission Progress</span>
            <span style="font-weight: 700; font-size: 16px; color: var(--primary);">${stats.percentage}%</span>
          </div>
          <div class="progress-bar-container" style="height: 8px; margin-bottom: 12px;">
            <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
          </div>
          <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 500;">
            <div style="color: #10b981;">● ${stats.received} Received</div>
            <div style="color: #d97706;">● ${stats.remarks} Needs Correction</div>
            <div style="color: #64748b;">● ${stats.pending} Pending</div>
            <div style="margin-left: auto;">Total target units: ${stats.total}</div>
          </div>
        </div>
        
        <div style="flex: 1; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px;">
          <table class="table" style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
            <thead>
              <tr style="background: var(--bg-main); border-bottom: 1px solid var(--border);">
                <th style="text-align: left; padding: 12px;">Department Name</th>
                <th style="text-align: left; padding: 12px;">Shift</th>
                <th style="text-align: left; padding: 12px;">Status</th>
                <th style="text-align: left; padding: 12px;">Submitted Time</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4" style="text-align:center; padding:20px;">No departments match the status filter criteria.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Failed to load checklist details:", err);
    panel.innerHTML = `<div style="text-align:center; margin: auto; padding: 40px; color: var(--text-danger);">Failed to load checklist details.</div>`;
  }
}

// ================= APP BOOTSTRAPPING =================
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadEvents();
    await loadDepartments();
  } catch(e) {
    console.warn("Backend not running or offline. Please run `npm start` to connect database.");
  }
  
  if (window.location.pathname === '/status') {
    document.body.classList.add('public-status-mode');
    const loginView = document.getElementById('login-view');
    if (loginView) loginView.style.display = 'none';
    const appView = document.getElementById('app-view');
    if (appView) appView.style.display = 'block';
    
    switchSubView('public-status');
  } else {
      checkSession();
  }
  startClock();
});

// ================= USER ACTION PLAN FORM MANUAL ENTRY =================

const partAFields = [
  { id: 1, label: "PhD Programme", type: "text" },
  { id: 2, label: "PG Programme", type: "text" },
  { id: 3, label: "UG Programme", type: "text" },
  { id: 4, label: "MQC", note: "Assign faculty members with five or more years of experience", type: "text" },
  { id: 5, label: "JosTEL", type: "text" },
  { id: 6, label: "Question Bank", note: "For SPL & Comprehensive Courses", type: "qbank" },
  { id: 7, label: "Internship", type: "split", labels: ["UG", "PG"] },
  { id: 8, label: "Project", type: "split", labels: ["UG", "PG"] },
  { id: 9, label: "MOOCs", type: "split", labels: ["UG", "PG"] },
  { id: 10, label: "Student Progression", type: "split", labels: ["UG", "PG"] },
  { id: 11, label: "Placement", type: "split", labels: ["UG", "PG"] },
  { id: 12, label: "Industry Collaboration", type: "text" },
  { id: 13, label: "Coaching Programmes for Competitive Exams", type: "text" },
  { id: 14, label: "Association", type: "split", labels: ["President", "Vice - President"] },
  { id: 15, label: "INDEP", type: "text" },
  { id: 16, label: "Sports Activities", type: "text" },
  { id: 17, label: "Consultancy & Corporate Training", type: "text" },
  { id: 18, label: "Girls' Student In-charge", type: "text" },
  { id: 19, label: "SHEPHERD", type: "split", labels: ["Boys", "Girls"] },
  { id: 20, label: "Department Inventory & Procurement", type: "text" },
  { id: 21, label: "Department Library", type: "text" },
  { id: 22, label: "Department Website", type: "text" },
  { id: 23, label: "Specific Lab(s) in the Department", type: "text" }
];

const partBFields = [
  { id: 1, label: "Value-Added Course" },
  { id: 2, label: "Certificate Course" },
  { id: 3, label: "Association Inauguration" },
  { id: 4, label: "Association Valediction" },
  { id: 5, label: "Skill Development Programmes" },
  { id: 6, label: "Technical Club Activities" },
  { id: 7, label: "Cultural Club Activities" },
  { id: 8, label: "Technical / Cultural Festival" },
  { id: 9, label: "Diversity & Inclusion Activities" },
  { id: 10, label: "Ideation Workshops / Hackathons" },
  { id: 11, label: "Mental Health / Wellness Activities" },
  { id: 12, label: "Gender Sensitization & Health Programmes" },
  { id: 13, label: "Community Awareness and Social Outreach Activities" },
  { id: 14, label: "IKS Activities" },
  { id: 15, label: "Remedial Coaching" },
  { id: 16, label: "Educational Tour" },
  { id: 17, label: "Parent – Teacher Meet (other than the common meeting by the College)" },
  { id: 18, label: "Alumni Meeting (other than the Global Reunion)" },
  { id: 19, label: "Endowment Lecture(s)" }
];

function renderUserActionPlanForm() {
  const deptInput = document.getElementById('user-plan-dept');
  if (deptInput) {
    deptInput.value = '';
    deptInput.readOnly = false;
  }
  const coordinatorInput = document.getElementById('user-plan-coordinator');
  if (coordinatorInput) {
    coordinatorInput.value = '';
  }
  const shiftInput = document.getElementById('user-plan-shift');
  if (shiftInput) {
    shiftInput.value = 'Shift 1';
    shiftInput.disabled = false;
  }

  // Check if current user is Staff or Director
  const isStaff = (state.currentUser && (state.currentUser.role === 'Staff' || state.currentUser.role === 'Director'));
  const isDefaultMode = !isStaff; // Lock default rows only if NOT staff/director

  // Bind change/blur listeners once to auto-load action plans
  if (!state.actionPlanListenersBound) {
    if (deptInput && shiftInput) {
      const handler = () => {
        const dept = deptInput.value.trim();
        const shift = shiftInput.value;
        if (dept && shift) {
          loadExistingActionPlan(dept, shift);
        }
      };
      deptInput.addEventListener('change', handler);
      shiftInput.addEventListener('change', handler);
      state.actionPlanListenersBound = true;
    }
  }

  // Pre-fill department and shift for department user
  if (state.currentUser && state.currentUser.role === 'User') {
    if (state.currentUser.name && state.currentUser.name !== 'Department User') {
      const userDeptName = state.currentUser.name.trim();
      const matchedDept = (state.departments || []).find(d => d.name.toLowerCase() === userDeptName.toLowerCase());
      
      if (deptInput) {
        deptInput.value = userDeptName;
        deptInput.readOnly = true;
      }
      
      if (shiftInput && matchedDept) {
        shiftInput.value = matchedDept.shift;
        shiftInput.disabled = true;
      }
      
      // Load the existing action plan immediately!
      if (userDeptName && matchedDept) {
        loadExistingActionPlan(userDeptName, matchedDept.shift);
        return; // loadExistingActionPlan handles rendering
      }
    }
  }

  // Render blank/default form if no automatic load occurred
  const tbodyA = document.getElementById('user-plan-part-a-body');
  if (tbodyA) {
    tbodyA.innerHTML = '';
    partAFields.forEach(f => {
      addUserPlanPartARow(f.id, f.label, '', isDefaultMode);
    });
  }

  const tbodyB = document.getElementById('user-plan-part-b-body');
  if (tbodyB) {
    tbodyB.innerHTML = '';
    partBFields.forEach(f => {
      addUserPlanPartBRow(f.id, f.label, '', '', '', isDefaultMode);
    });
  }

  const tbodyMentors = document.getElementById('user-plan-mentors-body');
  if (tbodyMentors) {
    tbodyMentors.innerHTML = '';
    addUserPlanMentorRow('I UG', '');
    addUserPlanMentorRow('II UG', '');
    addUserPlanMentorRow('III UG', '');
    addUserPlanMentorRow('I PG', '');
    addUserPlanMentorRow('II PG', '');
  }

  document.getElementById('user-plan-clubs-body').innerHTML = '';
  document.getElementById('user-plan-conferences-body').innerHTML = '';
  document.getElementById('user-plan-aaa-body').innerHTML = '';
  
  addUserPlanClubRow();
  addUserPlanConferenceRow();
  addUserPlanAaaRow();
}

async function loadExistingActionPlan(department, shift) {
  if (!state.involvementCategories) {
    await loadInvolvementData();
  }
  const cardName = `${department} (${shift}) Action Plan 2026-2027`;
  const category = state.involvementCategories.find(c => c.name.toLowerCase() === cardName.toLowerCase());
  
  const isStaff = (state.currentUser && (state.currentUser.role === 'Staff' || state.currentUser.role === 'Director'));
  const isDefaultMode = !isStaff;
  
  if (category) {
    // Populate coordinator
    const coordinatorInput = document.getElementById('user-plan-coordinator');
    if (coordinatorInput) {
      coordinatorInput.value = category.coordinator || '';
    }
    
    // Fetch all records for this category
    const catRecords = (state.involvementRecords || []).filter(r => r.category_id === category.id);
    
    // Clear and populate Part A
    const tbodyA = document.getElementById('user-plan-part-a-body');
    if (tbodyA) {
      tbodyA.innerHTML = '';
      const partARecords = catRecords.filter(r => r.section_type === 'Part A');
      
      // Populate defaults first (preserving their default status)
      partAFields.forEach(f => {
        const record = partARecords.find(r => r.col2 === f.label || parseInt(r.col1) === f.id);
        const val = record ? record.col3 : '';
        addUserPlanPartARow(f.id, f.label, val, isDefaultMode);
      });
      
      // Populate custom rows
      const defaultLabels = partAFields.map(f => f.label.toLowerCase());
      partARecords.forEach(r => {
        const isDefaultRow = defaultLabels.includes(r.col2.toLowerCase()) || (parseInt(r.col1) >= 1 && parseInt(r.col1) <= 23);
        if (!isDefaultRow) {
          addUserPlanPartARow(r.col1, r.col2, r.col3, false);
        }
      });
    }
    
    // Clear and populate Part B
    const tbodyB = document.getElementById('user-plan-part-b-body');
    if (tbodyB) {
      tbodyB.innerHTML = '';
      const partBRecords = catRecords.filter(r => r.section_type === 'Part B');
      
      // Populate defaults first
      partBFields.forEach(f => {
        const record = partBRecords.find(r => r.col2 === f.label || parseInt(r.col1) === f.id);
        const month = record ? record.col3 : '';
        const target = record ? record.col4 : '';
        const coord = record ? record.col5 : '';
        addUserPlanPartBRow(f.id, f.label, month, target, coord, isDefaultMode);
      });
      
      // Populate custom rows
      const defaultLabels = partBFields.map(f => f.label.toLowerCase());
      partBRecords.forEach(r => {
        const isDefaultRow = defaultLabels.includes(r.col2.toLowerCase()) || (parseInt(r.col1) >= 1 && parseInt(r.col1) <= 19);
        if (!isDefaultRow) {
          addUserPlanPartBRow(r.col1, r.col2, r.col3, r.col4, r.col5, false);
        }
      });
    }
    
    // Clear and populate Class Mentors
    const tbodyMentors = document.getElementById('user-plan-mentors-body');
    if (tbodyMentors) {
      tbodyMentors.innerHTML = '';
      const mentorRecords = catRecords.filter(r => r.section_type === 'Class Mentors');
      if (mentorRecords.length > 0) {
        mentorRecords.forEach(r => {
          addUserPlanMentorRow(r.col1, r.col2);
        });
      } else {
        addUserPlanMentorRow('I UG', '');
        addUserPlanMentorRow('II UG', '');
        addUserPlanMentorRow('III UG', '');
        addUserPlanMentorRow('I PG', '');
        addUserPlanMentorRow('II PG', '');
      }
    }
    
    // Clear and populate Clubs
    const tbodyClubs = document.getElementById('user-plan-clubs-body');
    if (tbodyClubs) {
      tbodyClubs.innerHTML = '';
      const clubRecords = catRecords.filter(r => r.section_type === 'Clubs');
      if (clubRecords.length > 0) {
        clubRecords.forEach(r => {
          addUserPlanClubRow(r.col1, r.col2, r.col3, r.col4);
        });
      } else {
        addUserPlanClubRow();
      }
    }
    
    // Clear and populate Conferences
    const tbodyConferences = document.getElementById('user-plan-conferences-body');
    if (tbodyConferences) {
      tbodyConferences.innerHTML = '';
      const confRecords = catRecords.filter(r => r.section_type === 'Conferences');
      if (confRecords.length > 0) {
        confRecords.forEach(r => {
          addUserPlanConferenceRow(r.col1, r.col2, r.col3, r.col4, r.col5, r.col6, r.col7, r.col8);
        });
      } else {
        addUserPlanConferenceRow();
      }
    }
    
    // Clear and populate AAA Proposed Plan
    const tbodyAaa = document.getElementById('user-plan-aaa-body');
    if (tbodyAaa) {
      tbodyAaa.innerHTML = '';
      const aaaRecords = catRecords.filter(r => r.section_type === 'AAA Proposed Plan');
      if (aaaRecords.length > 0) {
        aaaRecords.forEach(r => {
          addUserPlanAaaRow(r.col1, r.col2, r.col3, r.col4);
        });
      } else {
        addUserPlanAaaRow();
      }
    }
  } else {
    // Keep inputs but reset tables
    const tbodyA = document.getElementById('user-plan-part-a-body');
    if (tbodyA) {
      tbodyA.innerHTML = '';
      partAFields.forEach(f => {
        addUserPlanPartARow(f.id, f.label, '', isDefaultMode);
      });
    }
    const tbodyB = document.getElementById('user-plan-part-b-body');
    if (tbodyB) {
      tbodyB.innerHTML = '';
      partBFields.forEach(f => {
        addUserPlanPartBRow(f.id, f.label, '', '', '', isDefaultMode);
      });
    }
    const tbodyMentors = document.getElementById('user-plan-mentors-body');
    if (tbodyMentors) {
      tbodyMentors.innerHTML = '';
      addUserPlanMentorRow('I UG', '');
      addUserPlanMentorRow('II UG', '');
      addUserPlanMentorRow('III UG', '');
      addUserPlanMentorRow('I PG', '');
      addUserPlanMentorRow('II PG', '');
    }
    document.getElementById('user-plan-clubs-body').innerHTML = '';
    document.getElementById('user-plan-conferences-body').innerHTML = '';
    document.getElementById('user-plan-aaa-body').innerHTML = '';
    
    addUserPlanClubRow();
    addUserPlanConferenceRow();
    addUserPlanAaaRow();
  }
}

function addUserPlanPartARow(sNo = '', label = '', val = '', isDefault = false) {
  const tbody = document.getElementById('user-plan-part-a-body');
  if (!tbody) return;
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  
  if (isDefault) {
    tr.innerHTML = `
      <td style="padding: 8px; text-align: center; font-weight: 600;">${nextSNo}</td>
      <td style="padding: 8px; font-weight: 500; color: var(--text-main);">${label}</td>
      <td style="padding: 8px;">
        <textarea class="form-control parta-val" placeholder="Faculty name(s) or Details" style="height:38px; min-height:38px; padding: 6px 8px; resize: vertical; font-size: 13px;">${val}</textarea>
        <input type="hidden" class="parta-sno" value="${nextSNo}">
        <input type="hidden" class="parta-label" value="${label}">
      </td>
      <td style="padding: 8px; text-align: right;"></td>
    `;
  } else {
    tr.innerHTML = `
      <td style="padding: 8px; text-align: center; font-weight: 600;"><input type="text" class="form-control parta-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
      <td style="padding: 8px;"><input type="text" class="form-control parta-label" value="${label}" placeholder="Area of Responsibility" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;"><textarea class="form-control parta-val" placeholder="Faculty name(s) or Details" style="height:38px; min-height:38px; padding: 6px 8px; resize: vertical; font-size: 13px;">${val}</textarea></td>
      <td style="padding: 8px; text-align: right;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); reindexUserPlanTable('user-plan-part-a-body');" style="padding: 4px 8px; font-size:11px;">Remove</button>
      </td>
    `;
  }
  tbody.appendChild(tr);
}

function addUserPlanPartBRow(sNo = '', label = '', month = '', target = '', coord = '', isDefault = false) {
  const tbody = document.getElementById('user-plan-part-b-body');
  if (!tbody) return;
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  
  if (isDefault) {
    tr.innerHTML = `
      <td style="padding: 8px; text-align: center; font-weight: 600;">${nextSNo}</td>
      <td style="padding: 8px; font-weight: 500; color: var(--text-main);">${label}</td>
      <td style="padding: 8px;"><input type="text" class="form-control partb-month" value="${month}" placeholder="Month" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;"><input type="text" class="form-control partb-target" value="${target}" placeholder="Target Group" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;">
        <textarea class="form-control partb-coordinator" placeholder="Coordinator(s)" style="height:38px; min-height:38px; padding: 6px 8px; resize: vertical; font-size: 13px;">${coord}</textarea>
        <input type="hidden" class="partb-sno" value="${nextSNo}">
        <input type="hidden" class="partb-label" value="${label}">
      </td>
      <td style="padding: 8px; text-align: right;"></td>
    `;
  } else {
    tr.innerHTML = `
      <td style="padding: 8px; text-align: center; font-weight: 600;"><input type="text" class="form-control partb-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
      <td style="padding: 8px;"><input type="text" class="form-control partb-label" value="${label}" placeholder="Activity Description" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;"><input type="text" class="form-control partb-month" value="${month}" placeholder="Month" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;"><input type="text" class="form-control partb-target" value="${target}" placeholder="Target Group" style="height:32px; padding-left:8px; font-size: 13px;"></td>
      <td style="padding: 8px;"><textarea class="form-control partb-coordinator" placeholder="Coordinator(s)" style="height:38px; min-height:38px; padding: 6px 8px; resize: vertical; font-size: 13px;">${coord}</textarea></td>
      <td style="padding: 8px; text-align: right;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); reindexUserPlanTable('user-plan-part-b-body');" style="padding: 4px 8px; font-size:11px;">Remove</button>
      </td>
    `;
  }
  tbody.appendChild(tr);
}

function addUserPlanMentorRow(className = '', mentorName = '') {
  const tbody = document.getElementById('user-plan-mentors-body');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 8px;"><input type="text" class="form-control mentor-class" value="${className}" placeholder="e.g. I UG A" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control mentor-name" value="${mentorName}" placeholder="e.g. Dr. A. Raj" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px; text-align: right;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove();" style="padding: 4px 8px; font-size:11px;">Remove</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function addUserPlanClubRow(sNo = '', name = '', nature = 'Technical', faculty = '') {
  const tbody = document.getElementById('user-plan-clubs-body');
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 8px;"><input type="text" class="form-control club-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
    <td style="padding: 8px;"><input type="text" class="form-control club-name" value="${name}" placeholder="Coder's Club" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;">
      <select class="form-select club-nature" style="height:32px; padding: 4px 8px; font-size: 13px;">
        <option value="Technical" ${nature === 'Technical' ? 'selected' : ''}>Technical</option>
        <option value="Cultural" ${nature === 'Cultural' ? 'selected' : ''}>Cultural</option>
        <option value="Domain" ${nature === 'Domain' ? 'selected' : ''}>Domain</option>
        <option value="others" ${nature === 'others' || nature === 'Others' ? 'selected' : ''}>Others</option>
      </select>
    </td>
    <td style="padding: 8px;"><input type="text" class="form-control club-faculty" value="${faculty}" placeholder="Faculty name(s)" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px; text-align: right;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); reindexUserPlanTable('user-plan-clubs-body');" style="padding: 4px 8px; font-size:11px;">Remove</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function addUserPlanConferenceRow(sNo = '', title = '', type = 'FDP', nature = 'N', month = '', coord = '', iks = '-', sdg = '-') {
  const tbody = document.getElementById('user-plan-conferences-body');
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 8px;"><input type="text" class="form-control conf-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
    <td style="padding: 8px;"><input type="text" class="form-control conf-title" value="${title}" placeholder="Teaching Pedagogy" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;">
      <select class="form-select conf-type" style="height:32px; padding: 4px 8px; font-size: 13px;">
        <option value="FDP" ${type === 'FDP' ? 'selected' : ''}>FDP</option>
        <option value="Conference" ${type === 'Conference' ? 'selected' : ''}>Conference</option>
        <option value="Seminar" ${type === 'Seminar' ? 'selected' : ''}>Seminar</option>
        <option value="Workshop" ${type === 'Workshop' ? 'selected' : ''}>Workshop</option>
        <option value="Webinar" ${type === 'Webinar' ? 'selected' : ''}>Webinar</option>
      </select>
    </td>
    <td style="padding: 8px;">
      <select class="form-select conf-nature" style="height:32px; padding: 4px 8px; font-size: 13px;">
        <option value="N" ${nature === 'N' ? 'selected' : ''}>National (N)</option>
        <option value="IN" ${nature === 'IN' ? 'selected' : ''}>International (IN)</option>
      </select>
    </td>
    <td style="padding: 8px;"><input type="text" class="form-control conf-month" value="${month}" placeholder="July" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control conf-coordinator" value="${coord}" placeholder="Faculty Coordinator" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;">
      <select class="form-select conf-iks" style="height:32px; padding: 4px 8px; font-size: 13px;">
        <option value="-" ${iks === '-' ? 'selected' : ''}>-</option>
        <option value="Yes" ${iks === 'Yes' ? 'selected' : ''}>Yes</option>
      </select>
    </td>
    <td style="padding: 8px;">
      <select class="form-select conf-sdg" style="height:32px; padding: 4px 8px; font-size: 13px;">
        <option value="-" ${sdg === '-' ? 'selected' : ''}>-</option>
        <option value="Yes" ${sdg === 'Yes' ? 'selected' : ''}>Yes</option>
      </select>
    </td>
    <td style="padding: 8px; text-align: right;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); reindexUserPlanTable('user-plan-conferences-body');" style="padding: 4px 8px; font-size:11px;">Remove</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function addUserPlanAaaRow(sNo = '', act = '', month = '', faculty = '') {
  const tbody = document.getElementById('user-plan-aaa-body');
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 8px;"><input type="text" class="form-control aaa-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
    <td style="padding: 8px;"><input type="text" class="form-control aaa-activity" value="${act}" placeholder="Provide certificate courses" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control aaa-month" value="${month}" placeholder="July" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control aaa-faculty" value="${faculty}" placeholder="Faculty Assigned" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px; text-align: right;">
      <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); reindexUserPlanTable('user-plan-aaa-body');" style="padding: 4px 8px; font-size:11px;">Remove</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function reindexUserPlanTable(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  Array.from(tbody.children).forEach((tr, index) => {
    const input = tr.querySelector('input[readonly]');
    if (input) {
      input.value = index + 1;
    }
  });
}

function resetUserActionPlanForm() {
  if (confirm("Are you sure you want to clear the form and start over?")) {
    document.getElementById('user-plan-form').reset();
    renderUserActionPlanForm();
  }
}

async function submitUserActionPlan(event) {
  event.preventDefault();
  
  const department = document.getElementById('user-plan-dept').value;
  const coordinator = document.getElementById('user-plan-coordinator').value.trim();
  const shift = document.getElementById('user-plan-shift').value;
  
  if (!department || !coordinator || !shift) {
    alert("Please fill in all metadata fields (Department, Head/Coordinator, and Shift).");
    return;
  }
  
  const cardName = `${department} (${shift}) Action Plan 2026-2027`;
  
  try {
    if (!state.involvementCategories) {
      await loadInvolvementData();
    }
    let category = state.involvementCategories.find(c => c.name.toLowerCase() === cardName.toLowerCase());
    let categoryId = '';
    
    if (!category) {
      const newCat = await fetchAPI('/involvement/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: cardName,
          department: department,
          coordinator: coordinator,
          shift: shift
        })
      });
      categoryId = newCat.id;
    } else {
      categoryId = category.id;
      await fetchAPI(`/involvement/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: category.name,
          department: department,
          coordinator: coordinator,
          shift: shift
        })
      });
    }
    
    const records = [];
    
    const partARows = document.getElementById('user-plan-part-a-body').children;
    Array.from(partARows).forEach(row => {
      const sNo = row.querySelector('.parta-sno').value;
      const label = row.querySelector('.parta-label').value.trim();
      const val = row.querySelector('.parta-val').value.trim();
      
      if (label) {
        records.push({
          section_type: "Part A",
          col1: sNo,
          col2: label,
          col3: val || '-'
        });
      }
    });
    
    const clubRows = document.getElementById('user-plan-clubs-body').children;
    Array.from(clubRows).forEach(row => {
      const sNo = row.querySelector('.club-sno').value;
      const name = row.querySelector('.club-name').value.trim();
      const nature = row.querySelector('.club-nature').value;
      const faculty = row.querySelector('.club-faculty').value.trim();
      
      if (name) {
        records.push({
          section_type: "Clubs",
          col1: sNo,
          col2: name,
          col3: nature,
          col4: faculty || '-'
        });
      }
    });
    
    const mentorRows = document.getElementById('user-plan-mentors-body').children;
    Array.from(mentorRows).forEach(row => {
      const className = row.querySelector('.mentor-class').value.trim();
      const mentorName = row.querySelector('.mentor-name').value.trim();
      
      if (className) {
        records.push({
          section_type: "Class Mentors",
          col1: className,
          col2: mentorName || '-'
        });
      }
    });
    
    const partBRows = document.getElementById('user-plan-part-b-body').children;
    Array.from(partBRows).forEach(row => {
      const sNo = row.querySelector('.partb-sno').value;
      const label = row.querySelector('.partb-label').value.trim();
      const month = row.querySelector('.partb-month').value.trim();
      const target = row.querySelector('.partb-target').value.trim();
      const coord = row.querySelector('.partb-coordinator').value.trim();
      
      if (label) {
        records.push({
          section_type: "Part B",
          col1: sNo,
          col2: label,
          col3: month || '-',
          col4: target || '-',
          col5: coord || '-'
        });
      }
    });
    
    const confRows = document.getElementById('user-plan-conferences-body').children;
    Array.from(confRows).forEach(row => {
      const sNo = row.querySelector('.conf-sno').value;
      const title = row.querySelector('.conf-title').value.trim();
      const type = row.querySelector('.conf-type').value;
      const nature = row.querySelector('.conf-nature').value;
      const month = row.querySelector('.conf-month').value.trim();
      const coord = row.querySelector('.conf-coordinator').value.trim();
      const iks = row.querySelector('.conf-iks').value;
      const sdg = row.querySelector('.conf-sdg').value;
      
      if (title) {
        records.push({
          section_type: "Conferences",
          col1: sNo,
          col2: title,
          col3: type,
          col4: nature,
          col5: month || '-',
          col6: coord || '-',
          col7: iks,
          col8: sdg
        });
      }
    });
    
    const aaaRows = document.getElementById('user-plan-aaa-body').children;
    Array.from(aaaRows).forEach(row => {
      const sNo = row.querySelector('.aaa-sno').value;
      const act = row.querySelector('.aaa-activity').value.trim();
      const month = row.querySelector('.aaa-month').value.trim();
      const faculty = row.querySelector('.aaa-faculty').value.trim();
      
      if (act) {
        records.push({
          section_type: "AAA Proposed Plan",
          col1: sNo,
          col2: act,
          col3: month || '-',
          col4: faculty || '-'
        });
      }
    });
    
    await fetchAPI('/involvement/records/bulk', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, records, clear_existing: true })
    });
    
    alert("Department Action Plan submitted and saved successfully!");
    
    await loadInvolvementData();
    renderUserActionPlanForm();
    
  } catch (err) {
    console.error("Failed to submit action plan manually:", err);
    alert("Failed to submit Action Plan: " + err.message);
  }
}
