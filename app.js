// IQAC Portal Application Logic (Light Theme, Database Integrated)

const API_BASE = '/api';

// ================= CUSTOM NOTIFICATION & DIALOG SYSTEM =================
let toastContainer = null;
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

function showToast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  const escapedMessage = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${escapedMessage}</div>
    <button class="toast-close" aria-label="Close notification">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  toast.querySelector('.toast-close').onclick = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  };

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }
  }, duration);
}

function showCustomDialog({ title, message, type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-dialog-modal');
    const iconWrapper = document.getElementById('custom-dialog-icon-wrapper');
    const titleEl = document.getElementById('custom-dialog-title');
    const messageEl = document.getElementById('custom-dialog-message');
    const confirmBtn = document.getElementById('custom-dialog-confirm-btn');
    const cancelBtn = document.getElementById('custom-dialog-cancel-btn');

    if (!modal || !iconWrapper || !titleEl || !messageEl || !confirmBtn || !cancelBtn) {
      resolve(confirm(message));
      return;
    }

    titleEl.innerText = title;
    messageEl.innerText = message;
    confirmBtn.innerText = confirmText;
    cancelBtn.innerText = cancelText;
    cancelBtn.style.display = showCancel ? 'block' : 'none';

    let iconSvg = '';
    let iconBg = '';
    let iconColor = '';
    confirmBtn.className = 'btn';

    if (type === 'success') {
      iconBg = 'rgba(16, 185, 129, 0.1)';
      iconColor = 'var(--success)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      confirmBtn.classList.add('btn-primary');
    } else if (type === 'error' || type === 'danger') {
      iconBg = '#fee2e2';
      iconColor = 'var(--danger)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      confirmBtn.classList.add(type === 'danger' ? 'btn-danger' : 'btn-primary');
    } else if (type === 'warning') {
      iconBg = 'var(--warning-bg)';
      iconColor = 'var(--warning)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      confirmBtn.classList.add('btn-primary');
    } else {
      iconBg = 'rgba(37, 99, 235, 0.1)';
      iconColor = 'var(--accent)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      confirmBtn.classList.add('btn-primary');
    }

    iconWrapper.style.backgroundColor = iconBg;
    iconWrapper.style.color = iconColor;
    iconWrapper.innerHTML = iconSvg;

    function closeModal() {
      modal.classList.remove('open');
    }

    confirmBtn.onclick = () => {
      closeModal();
      resolve(true);
    };

    cancelBtn.onclick = () => {
      closeModal();
      resolve(false);
    };

    modal.classList.add('open');
  });
}

function showCustomConfirm(message, title = "Confirm Action", type = "warning", confirmText = "Yes, Continue", cancelText = "Cancel") {
  return showCustomDialog({
    title,
    message,
    type,
    confirmText,
    cancelText,
    showCancel: true
  });
}

// Override native alert with custom toast/dialog
window.alert = function(msg) {
  if (!msg) return;
  const isSuccess = /success|import|completed|saved|submitted/i.test(msg);
  const isError = /fail|error|could not|invalid|unsupported/i.test(msg);
  const type = isSuccess ? 'success' : (isError ? 'error' : 'info');
  
  if (isSuccess || (msg.length < 60 && !isError)) {
    showToast(msg, type);
  } else {
    showCustomDialog({
      title: isError ? "Error" : "Notification",
      message: msg,
      type: type,
      showCancel: false,
      confirmText: "Close"
    });
  }
};

// Core State
let state = {
  currentUser: null,
  activeSubView: null,
  events: [],
  departments: [],
  users: [],
  selectedEventId: null,
  programSortColumn: 'date',
  programSortOrder: 'desc',
  
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
    document.getElementById('common-uac-menu').style.display = 'block';
    switchSubView('staff-dashboard');
  } else if (userData.role === 'Director') {
    document.getElementById('staff-menu').style.display = 'none';
    document.getElementById('director-menu').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
    document.getElementById('common-uac-menu').style.display = 'block';
    switchSubView('director-dashboard');
  } else if (userData.role === 'User') {
    document.getElementById('staff-menu').style.display = 'none';
    document.getElementById('director-menu').style.display = 'none';
    document.getElementById('user-menu').style.display = 'flex';
    document.getElementById('common-uac-menu').style.display = 'none';
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
  document.querySelectorAll('.sidebar-menu li').forEach(item => {
    item.classList.remove('active');
    item.style.background = '';
  });

  // Handle active submenus opening/closing
  const submenuChecklist = document.getElementById('submenu-checklist');
  if (submenuChecklist) {
    const shouldShow = (viewId === 'staff-checklist' || viewId === 'staff-departments');
    submenuChecklist.style.display = shouldShow ? 'block' : 'none';
    const chevron = document.querySelector('#menu-staff-checklist-parent .chevron-icon');
    if (chevron) chevron.style.transform = shouldShow ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  const submenuInvolvement = document.getElementById('submenu-involvement');
  if (submenuInvolvement) {
    const shouldShow = (viewId === 'staff-involvement' || viewId === 'staff-tentative-plan' || viewId === 'staff-involvement-detail');
    submenuInvolvement.style.display = shouldShow ? 'block' : 'none';
    const chevron = document.querySelector('#menu-staff-involvement-parent .chevron-icon');
    if (chevron) chevron.style.transform = shouldShow ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  
  // Highlighting selected sidebar menu items
  if (viewId === 'staff-dashboard') {
    document.getElementById('subview-staff-dashboard').style.display = 'block';
    document.getElementById('menu-staff-dashboard').classList.add('active');
    document.getElementById('header-title').innerText = 'Staff Dashboard';
    await loadEvents();
    await loadDepartments();
    renderStaffDashboard();
  } else if (viewId === 'staff-events') {
    document.getElementById('subview-staff-events').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-events');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Manage Checklist';
    await loadEvents();
    await loadDepartments();
    await renderManageEvents();
  } else if (viewId === 'user-action-plan') {
    document.getElementById('subview-user-action-plan').style.display = 'block';
    document.getElementById('menu-user-action-plan').classList.add('active');
    document.getElementById('header-title').innerText = 'Department Action Plan';
    await loadDepartments();
    renderUserActionPlan();
  } else if (viewId === 'user-pes') {
    document.getElementById('subview-user-pes').style.display = 'block';
    document.getElementById('menu-user-pes').classList.add('active');
    document.getElementById('header-title').innerText = 'Performance & Excellence (PES)';
    await loadPesSubmissions();
    renderUserPesPage();
  } else if (viewId === 'staff-pes') {
    document.getElementById('subview-staff-pes').style.display = 'block';
    document.getElementById('menu-staff-pes').classList.add('active');
    document.getElementById('header-title').innerText = 'Performance & Excellence (PES) Summary';
    await loadPesSubmissions();
    await loadDepartments();
    renderStaffPesPage();
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
    const staffUac = document.getElementById('menu-staff-uac');
    if (staffUac) staffUac.classList.add('active');
    const dirUac = document.getElementById('menu-director-uac');
    if (dirUac) dirUac.classList.add('active');
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
    document.getElementById('header-title').innerText = 'Staff Involvement';
    await loadInvolvementData();
    await loadDepartments();
    renderStaffInvolvementRestructured();
  } else if (viewId === 'staff-tentative-plan') {
    document.getElementById('subview-staff-tentative-plan').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-tentative-plan');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Tentative Plans';
    await loadInvolvementData();
    await loadDepartments();
    renderStaffTentativePlan();
  } else if (viewId === 'staff-involvement-detail') {
    document.getElementById('subview-staff-involvement-detail').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-involvement');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Category Details';
    await loadInvolvementData();
    await loadDepartments();
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
  } else if (viewId === 'staff-ewyl') {
    document.getElementById('subview-staff-ewyl').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-ewyl');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Earn While You Learn (EWYL)';
    await loadEwylDashboard();
  } else if (viewId === 'staff-ewyl-hours') {
    document.getElementById('subview-staff-ewyl-hours').style.display = 'block';
    document.getElementById('header-title').innerText = 'Student Working Hours Log';
    await renderEwylHoursLogPage();
  } else if (viewId === 'staff-ewyl-letter') {
    document.getElementById('subview-staff-ewyl-letter').style.display = 'block';
    document.getElementById('header-title').innerText = 'Remuneration Claim Letter';
  } else if (viewId === 'staff-college-events') {
    document.getElementById('subview-staff-college-events').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-college-events');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'College Events';
    await loadCollegePrograms();
    renderCollegePrograms();
  } else if (viewId === 'user-pes') {
    document.getElementById('subview-user-pes').style.display = 'block';
    const menuEl = document.getElementById('menu-user-pes');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Performance & Excellence Scorecard';
    await loadPesSubmissions();
    renderUserPesPage();
  } else if (viewId === 'staff-pes') {
    document.getElementById('subview-staff-pes').style.display = 'block';
    const menuEl = document.getElementById('menu-staff-pes');
    if (menuEl) menuEl.classList.add('active');
    document.getElementById('header-title').innerText = 'Performance & Excellence (PES)';
    await loadPesSubmissions();
    await loadDepartments();
    renderStaffPesPage();
  }
}

function isDeptInScope(dept, scope) {
  if (!scope) return false;
  const scopeItems = scope.split(',').map(s => s.trim().toLowerCase());
  if (scopeItems.includes(dept.shift.toLowerCase())) return true;
  if (scopeItems.includes(dept.name.toLowerCase())) return true;
  if (scopeItems.includes(String(dept.id).toLowerCase())) return true;
  return false;
}

function renderEventDepartmentsList(selectedScopeStr = '') {
  const container = document.getElementById('event-departments-list');
  if (!container) return;
  
  // Sort departments by shift and name
  const sortedDepts = [...state.departments].sort((a, b) => {
    if (a.shift !== b.shift) return a.shift.localeCompare(b.shift);
    return a.name.localeCompare(b.name);
  });
  
  container.innerHTML = sortedDepts.map(dept => {
    // If selectedScopeStr is empty, check all by default. Otherwise check if in scope.
    const isChecked = selectedScopeStr ? isDeptInScope(dept, selectedScopeStr) : true;
    return `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-main); font-weight: 500; margin-bottom: 2px;">
        <input type="checkbox" class="event-dept-checkbox" value="${dept.name}" data-shift="${dept.shift}" ${isChecked ? 'checked' : ''}>
        <span title="${dept.name} (${dept.shift})">${dept.name} <small style="color: var(--text-muted); font-size: 10px;">(${dept.shift})</small></span>
      </label>
    `;
  }).join('');
}

function toggleEventDeptSelection(type) {
  const checkboxes = document.querySelectorAll('.event-dept-checkbox');
  checkboxes.forEach(cb => {
    if (type === 'all') {
      cb.checked = true;
    } else if (type === 'none') {
      cb.checked = false;
    } else {
      // type is shift name (e.g. 'Shift 1' or 'Shift 2')
      const shift = cb.getAttribute('data-shift');
      if (shift === type) {
        cb.checked = true;
      }
    }
  });
}

async function addNewDeptFromEventModal() {
  const name = prompt("Enter new department name:");
  if (!name) return;
  
  const shift = prompt("Enter shift (Shift 1, Shift 2, or Combined Department):", "Shift 1");
  if (!shift) return;
  
  const validShifts = ["Shift 1", "Shift 2", "Combined Department"];
  if (!validShifts.includes(shift)) {
    alert("Invalid shift. Please enter 'Shift 1', 'Shift 2', or 'Combined Department'.");
    return;
  }
  
  try {
    const category = prompt("Enter department category (e.g. Science, Arts, Postgraduate):", "Arts");
    if (!category) return;

    const newDept = await fetchAPI('/departments', {
      method: 'POST',
      body: JSON.stringify({ name, category, shift })
    });
    
    // Reload state.departments
    state.departments = await fetchAPI('/departments');
    
    // Re-render the departments checkboxes list, keeping existing checked items checked!
    const checkedNames = Array.from(document.querySelectorAll('.event-dept-checkbox'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    checkedNames.push(newDept.name);
    
    renderEventDepartmentsList(checkedNames.join(','));
  } catch (err) {
    alert("Failed to add department: " + err.message);
  }
}

// 6. Stats & Calculations
function getEventStats(evt, checklists) {
  const scope = evt.shifts_scope || 'Shift 1,Shift 2,Combined Department';
  const targetDepts = state.departments.filter(dept => isDeptInScope(dept, scope));
  
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
          <p>Go to "Manage Checklist" to add your first reporting schedule.</p>
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
  
  // Render departments list with all checked by default
  renderEventDepartmentsList('');
  
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
  
  // Render departments list using the event's shifts_scope
  renderEventDepartmentsList(evt.shifts_scope);
  
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

  const checkedDpts = Array.from(document.querySelectorAll('.event-dept-checkbox'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (checkedDpts.length === 0) {
    alert("Please select at least one target department.");
    return;
  }
  const shifts_scope = checkedDpts.join(',');

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
  if (await showCustomConfirm("Are you sure you want to delete this event? All checklist records will be deleted!", "Delete Event", "danger", "Yes, Delete")) {
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
  if (await showCustomConfirm("Are you sure you want to delete this department? This will delete all its submission records across all checklists!", "Delete Department", "danger", "Yes, Delete")) {
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
    if (!isDeptInScope(dept, scope)) return false;

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
    const targetDepts = state.departments.filter(dept => isDeptInScope(dept, scope));

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
    if (!isDeptInScope(dept, scope)) return false;

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
  if (await showCustomConfirm("Are you sure you want to delete this user? They will lose access immediately.", "Delete User", "danger", "Yes, Delete")) {
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
      if (!isDeptInScope(dept, scope)) return false;

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
  renderStaffInvolvementRestructured();
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCleanDeptAndShift(category) {
  let dept = category.department || '';
  let shift = category.shift || '';
  
  // Normalize shift always
  if (shift === 'Shift I') shift = 'Shift 1';
  else if (shift === 'Shift II') shift = 'Shift 2';
  
  if ((!dept || !shift) && category.name) {
    const match = category.name.match(/^(.*?)\s*\((Shift 1|Shift 2|Combined Department|Shift I|Shift II)\)/i);
    if (match) {
      if (!dept) dept = match[1].trim();
      if (!shift) {
        let shiftVal = match[2].trim();
        if (shiftVal === 'Shift I') shift = 'Shift 1';
        else if (shiftVal === 'Shift II') shift = 'Shift 2';
        else shift = shiftVal;
      }
    } else {
      if (!dept) dept = category.name;
    }
  }
  return { department: dept, shift: shift };
}

function renderStaffInvolvementRestructured() {
  // Populate the Department filter dropdown if it doesn't have options yet
  const deptSelect = document.getElementById('involvement-filter-dept');
  if (deptSelect && deptSelect.children.length <= 1) {
    const uniqueDepts = [...new Set((state.departments || []).map(d => d.name))].filter(Boolean).sort();
    deptSelect.innerHTML = '<option value="all">All Departments</option>' +
      uniqueDepts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  }

  const selectedResp = document.getElementById('involvement-filter-responsibility').value;
  const selectedDept = document.getElementById('involvement-filter-dept').value;
  const selectedShift = document.getElementById('involvement-filter-shift').value;

  const headingEl = document.getElementById('involvement-table-heading');
  if (headingEl) {
    let modeText = "Department Action Plans";
    if (selectedResp !== 'all') {
      modeText = `Responsibility Data (${selectedResp})`;
    }
    
    let parts = [];
    if (selectedShift !== 'all') parts.push(`Shift: ${selectedShift}`);
    if (selectedDept !== 'all') parts.push(`Department: ${selectedDept}`);
    
    let filterText = modeText;
    if (parts.length > 0) {
      filterText += " - " + parts.join(' | ');
    }
    headingEl.innerHTML = `<span style="font-weight: 700; font-size: 16px; color: var(--primary);">${escapeHtml(filterText)}</span>`;
  }

  const thead = document.getElementById('involvement-restructured-thead');
  const tbody = document.getElementById('involvement-restructured-tbody');
  if (!thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML = '';

  const showResponsibilityColumn = (selectedResp !== 'all');

  let headersHtml = '';
  if (!showResponsibilityColumn) {
    headersHtml = `
      <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Head / Coordinator</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Shift</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 13px; width: 150px;">Action</th>
      </tr>
    `;
  } else {
    headersHtml = `
      <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Shift</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px;">Head / Coordinator</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 13px; min-width: 250px;">Data (${escapeHtml(selectedResp)})</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 13px; width: 150px;">Action</th>
      </tr>
    `;
  }
  thead.innerHTML = headersHtml;

  const filteredCategories = (state.involvementCategories || []).filter(c => {
    const info = getCleanDeptAndShift(c);
    if (selectedDept !== 'all' && info.department !== selectedDept) return false;
    if (selectedShift !== 'all' && info.shift !== selectedShift) return false;
    return true;
  });

  if (filteredCategories.length === 0) {
    const colSpan = showResponsibilityColumn ? 5 : 4;
    tbody.innerHTML = `
      <tr>
        <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No action plans match your current filters.
        </td>
      </tr>
    `;
    return;
  }

  filteredCategories.forEach(category => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    tr.style.transition = 'background 0.2s';
    tr.onmouseover = () => { tr.style.background = '#f8fafc'; };
    tr.onmouseout = () => { tr.style.background = 'transparent'; };

    const info = getCleanDeptAndShift(category);
    const deptName = info.department;
    const shift = info.shift;
    const coordinator = category.coordinator || '-';
    const viewButtonHtml = `
      <td style="padding: 12px 16px; text-align: center; white-space: nowrap;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <button class="btn btn-primary btn-xs" onclick="viewActionPlanFromStaff('${category.id}')" style="padding: 6px 12px; font-size: 12px; border-radius: 6px;">
            View Data
          </button>
          <button class="btn btn-danger btn-xs" onclick="confirmDeleteActionPlan('${category.id}', \`${escapeHtml(deptName).replace(/'/g, "\\'")}\`, '${shift}')" style="padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="Delete Action Plan">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;

    if (!showResponsibilityColumn) {
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main); font-size: 13px;">${escapeHtml(deptName)}</td>
        <td style="padding: 12px 16px; color: var(--text-main); font-size: 13px;">${escapeHtml(coordinator)}</td>
        <td style="padding: 12px 16px; font-size: 13px;"><span class="badge ${shift === 'Shift 1' ? 'badge-primary' : (shift === 'Shift 2' ? 'badge-secondary' : 'badge-success')}">${escapeHtml(shift)}</span></td>
        ${viewButtonHtml}
      `;
    } else {
      let matchingRecords = [];
      if (selectedResp === 'Clubs' || selectedResp === 'Class Mentors') {
        matchingRecords = (state.involvementRecords || []).filter(r => 
          r.category_id === category.id &&
          r.section_type === selectedResp
        );
      } else {
        matchingRecords = (state.involvementRecords || []).filter(r => 
          r.category_id === category.id &&
          r.section_type === 'Part A' &&
          r.col2 && r.col2.trim().toLowerCase() === selectedResp.trim().toLowerCase()
        );
      }

      let dataText = '';
      if (matchingRecords.length > 0) {
        if (selectedResp === 'Clubs') {
          dataText = matchingRecords.map(r => `<strong>${escapeHtml(r.col2)}</strong> (${escapeHtml(r.col4 || '-')})`).join('<br>');
        } else if (selectedResp === 'Class Mentors') {
          dataText = matchingRecords.map(r => `<strong>${escapeHtml(r.col1)}</strong>: ${escapeHtml(r.col2 || '-')}`).join('<br>');
        } else {
          dataText = matchingRecords.map(r => r.col3 || '-').join(', ');
        }
      } else {
        dataText = '<span style="color: var(--text-muted); font-style: italic;">Not Assigned</span>';
      }

      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main); font-size: 13px;">${escapeHtml(deptName)}</td>
        <td style="padding: 12px 16px; font-size: 13px;"><span class="badge ${shift === 'Shift 1' ? 'badge-primary' : (shift === 'Shift 2' ? 'badge-secondary' : 'badge-success')}">${escapeHtml(shift)}</span></td>
        <td style="padding: 12px 16px; color: var(--text-main); font-size: 13px;">${escapeHtml(coordinator)}</td>
        <td style="padding: 12px 16px; font-size: 13px; color: var(--primary); font-weight: 500; line-height: 1.4;">${dataText}</td>
        ${viewButtonHtml}
      `;
    }
    tbody.appendChild(tr);
  });
}

function viewActionPlanFromStaff(categoryId) {
  state.staffViewPlanId = categoryId;
  switchSubView('user-action-plan');
}

function confirmDeleteActionPlan(categoryId, deptName, shift) {
  const modal = document.getElementById('confirm-delete-modal');
  const textEl = document.getElementById('confirm-delete-text');
  const confirmBtn = document.getElementById('confirm-delete-submit-btn');
  
  if (!modal || !textEl || !confirmBtn) return;
  
  textEl.innerHTML = `Are you sure you want to delete the Action Plan for <strong>${escapeHtml(deptName)} (${escapeHtml(shift)})</strong>? This action cannot be undone and will delete all associated records.`;
  
  confirmBtn.onclick = async function() {
    try {
      confirmBtn.disabled = true;
      confirmBtn.innerText = 'Deleting...';
      
      await fetchAPI(`/involvement/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      closeConfirmDeleteModal();
      await loadInvolvementData();
      renderStaffInvolvementRestructured();
    } catch (err) {
      console.error("Failed to delete action plan:", err);
      alert("Failed to delete action plan: " + err.message);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerText = 'Yes, Delete';
    }
  };
  
  modal.classList.add('open');
}

function closeConfirmDeleteModal() {
  const modal = document.getElementById('confirm-delete-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

async function exportRestructuredInvolvementsExcel() {
  try {
    const selectedResp = document.getElementById('involvement-filter-responsibility').value;
    const selectedDept = document.getElementById('involvement-filter-dept').value;
    const selectedShift = document.getElementById('involvement-filter-shift').value;

    const filteredCats = (state.involvementCategories || []).filter(c => {
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      if (selectedShift !== 'all' && c.shift !== selectedShift) return false;
      return true;
    });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };

    let csvRows = [];
    csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
    csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
    csvRows.push([escapeCsv("Staff Involvement Restructured Report")]);
    
    let filterDesc = [];
    filterDesc.push(`Responsibility: ${selectedResp === 'all' ? 'All' : selectedResp}`);
    filterDesc.push(`Department: ${selectedDept === 'all' ? 'All' : selectedDept}`);
    filterDesc.push(`Shift: ${selectedShift === 'all' ? 'All' : selectedShift}`);
    csvRows.push([escapeCsv(`Filters - ${filterDesc.join(' | ')}`)]);
    csvRows.push([]);

    const showResponsibilityColumn = (selectedResp !== 'all');
    if (!showResponsibilityColumn) {
      csvRows.push([
        escapeCsv('Department Name'),
        escapeCsv('Head / Coordinator'),
        escapeCsv('Shift')
      ]);

      filteredCats.forEach(c => {
        csvRows.push([
          escapeCsv(c.department || c.name),
          escapeCsv(c.coordinator || '-'),
          escapeCsv(c.shift || '')
        ]);
      });
    } else {
      csvRows.push([
        escapeCsv('Department Name'),
        escapeCsv('Shift'),
        escapeCsv('Head / Coordinator'),
        escapeCsv(`Data (${selectedResp})`)
      ]);

      filteredCats.forEach(c => {
        let matchingRecords = [];
        if (selectedResp === 'Clubs' || selectedResp === 'Class Mentors') {
          matchingRecords = (state.involvementRecords || []).filter(r => 
            r.category_id === c.id &&
            r.section_type === selectedResp
          );
        } else {
          matchingRecords = (state.involvementRecords || []).filter(r => 
            r.category_id === c.id &&
            r.section_type === 'Part A' &&
            r.col2 && r.col2.trim().toLowerCase() === selectedResp.trim().toLowerCase()
          );
        }

        let dataText = '';
        if (matchingRecords.length > 0) {
          if (selectedResp === 'Clubs') {
            dataText = matchingRecords.map(r => `${r.col2 || '-'} (${r.col4 || '-'})`).join('; ');
          } else if (selectedResp === 'Class Mentors') {
            dataText = matchingRecords.map(r => `${r.col1 || '-'}: ${r.col2 || '-'}`).join('; ');
          } else {
            dataText = matchingRecords.map(r => r.col3 || '-').join(', ');
          }
        } else {
          dataText = 'Not Assigned';
        }

        csvRows.push([
          escapeCsv(c.department || c.name),
          escapeCsv(c.shift || ''),
          escapeCsv(c.coordinator || '-'),
          escapeCsv(dataText)
        ]);
      });
    }

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const filename = `staff_involvement_restructured_${selectedResp.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
    downloadCSV(csvContent, filename);
  } catch (err) {
    console.error("CSV Export failed:", err);
    alert("Failed to export Excel: " + err.message);
  }
}

async function exportRestructuredInvolvementsPDF() {
  try {
    const selectedResp = document.getElementById('involvement-filter-responsibility').value;
    const selectedDept = document.getElementById('involvement-filter-dept').value;
    const selectedShift = document.getElementById('involvement-filter-shift').value;

    const filteredCats = (state.involvementCategories || []).filter(c => {
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      if (selectedShift !== 'all' && c.shift !== selectedShift) return false;
      return true;
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002", 105, 15, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("Internal Quality Assurance Cell (IQAC)", 105, 21, { align: "center" });
    doc.text("Staff Involvement Restructured Report", 105, 27, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 31, 196, 31);
    
    const showResponsibilityColumn = (selectedResp !== 'all');
    let tableHeaders = [];
    let tableBody = [];

    if (!showResponsibilityColumn) {
      tableHeaders = [['Department Name', 'Head / Coordinator', 'Shift']];
      filteredCats.forEach(c => {
        tableBody.push([
          c.department || c.name,
          c.coordinator || '-',
          c.shift || ''
        ]);
      });
    } else {
      tableHeaders = [['Department Name', 'Shift', 'Head / Coordinator', `Data (${selectedResp})`]];
      filteredCats.forEach(c => {
        let matchingRecords = [];
        if (selectedResp === 'Clubs' || selectedResp === 'Class Mentors') {
          matchingRecords = (state.involvementRecords || []).filter(r => 
            r.category_id === c.id &&
            r.section_type === selectedResp
          );
        } else {
          matchingRecords = (state.involvementRecords || []).filter(r => 
            r.category_id === c.id &&
            r.section_type === 'Part A' &&
            r.col2 && r.col2.trim().toLowerCase() === selectedResp.trim().toLowerCase()
          );
        }

        let dataText = '';
        if (matchingRecords.length > 0) {
          if (selectedResp === 'Clubs') {
            dataText = matchingRecords.map(r => `${r.col2 || '-'} (${r.col4 || '-'})`).join('\n');
          } else if (selectedResp === 'Class Mentors') {
            dataText = matchingRecords.map(r => `${r.col1 || '-'}: ${r.col2 || '-'}`).join('\n');
          } else {
            dataText = matchingRecords.map(r => r.col3 || '-').join(', ');
          }
        } else {
          dataText = 'Not Assigned';
        }

        tableBody.push([
          c.department || c.name,
          c.shift || '',
          c.coordinator || '-',
          dataText
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
        styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] },
        margin: { left: 14, right: 14 }
      });
    }
    
    const filename = `staff_involvement_restructured_${selectedResp.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    doc.save(filename);
  } catch(err) {
    console.error("PDF Export failed:", err);
    alert("Failed to export PDF: " + err.message);
  }
}

function onTentativeTypeChange() {
  const typeSelect = document.getElementById('tentative-filter-type');
  if (typeSelect && typeSelect.value !== 'all') {
    const aaaSelect = document.getElementById('tentative-filter-aaa-month');
    if (aaaSelect) aaaSelect.value = 'all';
  }
  renderStaffTentativePlan();
}

function onTentativeAaaChange() {
  const aaaSelect = document.getElementById('tentative-filter-aaa-month');
  if (aaaSelect && aaaSelect.value !== 'all') {
    const typeSelect = document.getElementById('tentative-filter-type');
    if (typeSelect) typeSelect.value = 'all';
  }
  renderStaffTentativePlan();
}

function renderStaffTentativePlan() {
  // Populate the Department filter dropdown if it doesn't have options yet
  const deptSelect = document.getElementById('tentative-filter-dept');
  if (deptSelect && deptSelect.children.length <= 1) {
    const uniqueDepts = [...new Set((state.departments || []).map(d => d.name))].filter(Boolean).sort();
    deptSelect.innerHTML = '<option value="all">All Departments</option>' +
      uniqueDepts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  }

  const selectedMonth = document.getElementById('tentative-filter-month').value;
  const selectedDept = document.getElementById('tentative-filter-dept').value;
  const selectedShift = document.getElementById('tentative-filter-shift').value;
  const selectedType = document.getElementById('tentative-filter-type').value;
  const selectedAaaMonth = document.getElementById('tentative-filter-aaa-month').value;

  const thead = document.getElementById('tentative-plan-thead');
  const tbody = document.getElementById('tentative-plan-tbody');
  if (!thead || !tbody) return;

  thead.innerHTML = '';
  tbody.innerHTML = '';

  let mode = 'C';
  if (selectedType !== 'all') {
    mode = 'A';
  } else if (selectedAaaMonth !== 'all') {
    mode = 'B';
  }

  const headingEl = document.getElementById('tentative-table-heading');
  if (headingEl) {
    let modeText = "Part B Academic Activities";
    if (mode === 'A') {
      modeText = "Type (Conferences/FDP/Webinar)";
    } else if (mode === 'B') {
      modeText = "AAA Proposed Plan Month";
    }
    
    let parts = [];
    if (selectedShift !== 'all') parts.push(`Shift: ${selectedShift}`);
    if (selectedDept !== 'all') parts.push(`Department: ${selectedDept}`);
    if (selectedMonth !== 'all') parts.push(`Tentative Month: ${selectedMonth}`);
    if (selectedType !== 'all') parts.push(`Type: ${selectedType}`);
    if (selectedAaaMonth !== 'all') parts.push(`AAA Month: ${selectedAaaMonth}`);
    
    let filterText = modeText;
    if (parts.length > 0) {
      filterText += " - " + parts.join(' | ');
    }
    headingEl.innerHTML = `<span style="font-weight: 700; font-size: 16px; color: var(--primary);">${escapeHtml(filterText)}</span>`;
  }

  let headersHtml = '';
  if (mode === 'A') {
    headersHtml = `
      <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
        <th style="padding: 10px; text-align: left;">Department Name</th>
        <th style="padding: 10px; text-align: left; width: 80px;">Shift</th>
        <th style="padding: 10px; text-align: left;">Head / Coordinator</th>
        <th style="padding: 10px; text-align: left;">Title / Theme</th>
        <th style="padding: 10px; text-align: left; width: 100px;">Type</th>
        <th style="padding: 10px; text-align: left; width: 100px;">Nature</th>
        <th style="padding: 10px; text-align: left; width: 120px;">Tentative Month</th>
        <th style="padding: 10px; text-align: left;">Faculty Coordinator(s)</th>
        <th style="padding: 10px; text-align: left; width: 100px;">IKS Aligned</th>
        <th style="padding: 10px; text-align: left; width: 100px;">SDG Aligned</th>
        <th style="padding: 10px; text-align: left; width: 160px;">Status / Remark</th>
      </tr>
    `;
  } else if (mode === 'B') {
    headersHtml = `
      <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
        <th style="padding: 10px; text-align: left;">Department Name</th>
        <th style="padding: 10px; text-align: left; width: 80px;">Shift</th>
        <th style="padding: 10px; text-align: left;">Head / Coordinator</th>
        <th style="padding: 10px; text-align: left;">Planned Activity</th>
        <th style="padding: 10px; text-align: left; width: 120px;">Tentative Month</th>
        <th style="padding: 10px; text-align: left;">Faculty Assigned</th>
        <th style="padding: 10px; text-align: left; width: 160px;">Status / Remark</th>
      </tr>
    `;
  } else {
    headersHtml = `
      <tr style="background: #f8fafc; border-bottom: 1.5px solid var(--card-border);">
        <th style="padding: 10px; text-align: left;">Department Name</th>
        <th style="padding: 10px; text-align: left; width: 80px;">Shift</th>
        <th style="padding: 10px; text-align: left; width: 120px;">Tentative Month</th>
        <th style="padding: 10px; text-align: left;">Activity</th>
        <th style="padding: 10px; text-align: left;">Class / Target Group</th>
        <th style="padding: 10px; text-align: left;">Faculty Coordinator</th>
        <th style="padding: 10px; text-align: left; width: 160px;">Status / Remark</th>
      </tr>
    `;
  }
  thead.innerHTML = headersHtml;

  const filteredCats = (state.involvementCategories || []).filter(c => {
    const info = getCleanDeptAndShift(c);
    if (selectedDept !== 'all' && info.department !== selectedDept) return false;
    if (selectedShift !== 'all' && info.shift !== selectedShift) return false;
    return true;
  });

  let recordsToDisplay = [];

  const isMonthMatch = (recordMonth) => {
    if (selectedMonth === 'all') return true;
    if (!recordMonth) return false;
    return recordMonth.trim().toLowerCase() === selectedMonth.trim().toLowerCase();
  };

  const matchConfType = (recordType, selectedType) => {
    if (selectedType === 'all') return true;
    if (!recordType) return false;
    
    const rType = recordType.trim().toLowerCase();
    const sType = selectedType.trim().toLowerCase();
    
    const rNorm = rType.endsWith('s') ? rType.slice(0, -1) : rType;
    const sNorm = sType.endsWith('s') ? sType.slice(0, -1) : sType;
    
    return rNorm === sNorm;
  };

  filteredCats.forEach(cat => {
    const catRecords = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
    
    if (mode === 'A') {
      const confRecords = catRecords.filter(r => r.section_type === 'Conferences');
      confRecords.forEach(r => {
        if (!matchConfType(r.col3, selectedType)) return;
        if (!isMonthMatch(r.col5)) return;
        recordsToDisplay.push({ category: cat, record: r });
      });
    } else if (mode === 'B') {
      const aaaRecords = catRecords.filter(r => r.section_type === 'AAA Proposed Plan');
      aaaRecords.forEach(r => {
        if (selectedAaaMonth !== 'all' && r.col3 && r.col3.trim().toLowerCase() !== selectedAaaMonth.trim().toLowerCase()) return;
        if (!isMonthMatch(r.col3)) return;
        recordsToDisplay.push({ category: cat, record: r });
      });
    } else {
      const partBRecords = catRecords.filter(r => r.section_type === 'Part B');
      partBRecords.forEach(r => {
        if (!isMonthMatch(r.col3)) return;
        recordsToDisplay.push({ category: cat, record: r });
      });
    }
  });

  if (recordsToDisplay.length === 0) {
    const colSpan = mode === 'A' ? 11 : (mode === 'B' ? 7 : 7);
    tbody.innerHTML = `
      <tr>
        <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No tentative plans found matching the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  recordsToDisplay.forEach(item => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    
    const cat = item.category;
    const r = item.record;
    const info = getCleanDeptAndShift(cat);
    const dept = info.department;
    const shift = info.shift;
    const coordinator = cat.coordinator || '-';
    const status = r.status || 'Pending';
    const remark = r.remark || '';

    const statusCellHtml = `
      <td style="padding: 10px; font-size: 13px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div>
            <span class="badge ${status === 'Done' ? 'badge-success' : 'badge-secondary'}" style="padding: 4px 8px; font-size: 11px;">
              ${escapeHtml(status)}
            </span>
          </div>
          ${remark ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; max-width: 140px; word-wrap: break-word;">Remark: ${escapeHtml(remark)}</div>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <button class="btn ${status === 'Done' ? 'btn-secondary' : 'btn-success'} btn-xs" 
                    onclick="toggleRecordStatus('${r.id}', '${status === 'Done' ? 'Pending' : 'Done'}', \`${escapeHtml(remark).replace(/'/g, "\\'")}\`)" 
                    style="padding: 2px 6px; font-size: 11px;">
              ${status === 'Done' ? 'Undo' : 'Done'}
            </button>
            <button class="btn btn-primary btn-xs" 
                    onclick="editRecordRemark('${r.id}', '${status}', \`${escapeHtml(remark).replace(/'/g, "\\'")}\`)" 
                    style="padding: 2px 6px; font-size: 11px;">
              Remark
            </button>
          </div>
        </div>
      </td>
    `;

    if (mode === 'A') {
      tr.innerHTML = `
        <td style="padding: 10px; font-weight: 600; color: var(--text-main);">${escapeHtml(dept)}</td>
        <td style="padding: 10px;"><span class="badge ${shift === 'Shift 1' ? 'badge-primary' : (shift === 'Shift 2' ? 'badge-secondary' : 'badge-success')}">${escapeHtml(shift)}</span></td>
        <td style="padding: 10px;">${escapeHtml(coordinator)}</td>
        <td style="padding: 10px; font-weight: 500;">${escapeHtml(r.col2 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col3 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col4 || '-')}</td>
        <td style="padding: 10px; color: var(--primary); font-weight: 500;">${escapeHtml(r.col5 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col6 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col7 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col8 || '-')}</td>
        ${statusCellHtml}
      `;
    } else if (mode === 'B') {
      tr.innerHTML = `
        <td style="padding: 10px; font-weight: 600; color: var(--text-main);">${escapeHtml(dept)}</td>
        <td style="padding: 10px;"><span class="badge ${shift === 'Shift 1' ? 'badge-primary' : (shift === 'Shift 2' ? 'badge-secondary' : 'badge-success')}">${escapeHtml(shift)}</span></td>
        <td style="padding: 10px;">${escapeHtml(coordinator)}</td>
        <td style="padding: 10px; font-weight: 500;">${escapeHtml(r.col2 || '-')}</td>
        <td style="padding: 10px; color: var(--primary); font-weight: 500;">${escapeHtml(r.col3 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col4 || '-')}</td>
        ${statusCellHtml}
      `;
    } else {
      tr.innerHTML = `
        <td style="padding: 10px; font-weight: 600; color: var(--text-main);">${escapeHtml(dept)}</td>
        <td style="padding: 10px;"><span class="badge ${shift === 'Shift 1' ? 'badge-primary' : (shift === 'Shift 2' ? 'badge-secondary' : 'badge-success')}">${escapeHtml(shift)}</span></td>
        <td style="padding: 10px; color: var(--primary); font-weight: 500;">${escapeHtml(r.col3 || '-')}</td>
        <td style="padding: 10px; font-weight: 500;">${escapeHtml(r.col2 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col4 || '-')}</td>
        <td style="padding: 10px;">${escapeHtml(r.col5 || '-')}</td>
        ${statusCellHtml}
      `;
    }

    tbody.appendChild(tr);
  });
}

async function toggleRecordStatus(recordId, newStatus, currentRemark) {
  try {
    await fetchAPI(`/involvement/records/${recordId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, remark: currentRemark })
    });
    await loadInvolvementData();
    renderStaffTentativePlan();
  } catch (err) {
    console.error(err);
  }
}

async function editRecordRemark(recordId, currentStatus, currentRemark) {
  const newRemark = prompt("Enter Remark (or cancel to keep current):", currentRemark);
  if (newRemark === null) return;
  try {
    await fetchAPI(`/involvement/records/${recordId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: currentStatus, remark: newRemark })
    });
    await loadInvolvementData();
    renderStaffTentativePlan();
  } catch (err) {
    console.error(err);
  }
}

function exportTentativePlanExcel() {
  try {
    const selectedMonth = document.getElementById('tentative-filter-month').value;
    const selectedDept = document.getElementById('tentative-filter-dept').value;
    const selectedShift = document.getElementById('tentative-filter-shift').value;
    const selectedType = document.getElementById('tentative-filter-type').value;
    const selectedAaaMonth = document.getElementById('tentative-filter-aaa-month').value;

    let mode = 'C';
    if (selectedType !== 'all') {
      mode = 'A';
    } else if (selectedAaaMonth !== 'all') {
      mode = 'B';
    }

    const filteredCats = (state.involvementCategories || []).filter(c => {
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      if (selectedShift !== 'all' && c.shift !== selectedShift) return false;
      return true;
    });

    const isMonthMatch = (recordMonth) => {
      if (selectedMonth === 'all') return true;
      if (!recordMonth) return false;
      return recordMonth.trim().toLowerCase() === selectedMonth.trim().toLowerCase();
    };

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };

    let csvRows = [];
    csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
    csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
    csvRows.push([escapeCsv(`Tentative Department Action Plan Report - Mode ${mode}`)]);
    
    let filterDesc = [];
    filterDesc.push(`Month: ${selectedMonth === 'all' ? 'All' : selectedMonth}`);
    filterDesc.push(`Dept: ${selectedDept === 'all' ? 'All' : selectedDept}`);
    filterDesc.push(`Shift: ${selectedShift === 'all' ? 'All' : selectedShift}`);
    if (mode === 'A') filterDesc.push(`Type: ${selectedType}`);
    if (mode === 'B') filterDesc.push(`AAA Month: ${selectedAaaMonth}`);
    csvRows.push([escapeCsv(`Filters - ${filterDesc.join(' | ')}`)]);
    csvRows.push([]);

    let recordsToDisplay = [];
    filteredCats.forEach(cat => {
      const catRecords = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
      if (mode === 'A') {
        catRecords.filter(r => r.section_type === 'Conferences').forEach(r => {
          if (selectedType !== 'all' && r.col3 && r.col3.trim().toLowerCase() !== selectedType.trim().toLowerCase()) return;
          if (!isMonthMatch(r.col5)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      } else if (mode === 'B') {
        catRecords.filter(r => r.section_type === 'AAA Proposed Plan').forEach(r => {
          if (selectedAaaMonth !== 'all' && r.col3 && r.col3.trim().toLowerCase() !== selectedAaaMonth.trim().toLowerCase()) return;
          if (!isMonthMatch(r.col3)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      } else {
        catRecords.filter(r => r.section_type === 'Part B').forEach(r => {
          if (!isMonthMatch(r.col3)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      }
    });

    if (mode === 'A') {
      csvRows.push([
        escapeCsv('Department Name'),
        escapeCsv('Shift'),
        escapeCsv('Head / Coordinator'),
        escapeCsv('Title / Theme'),
        escapeCsv('Type'),
        escapeCsv('Nature'),
        escapeCsv('Tentative Month'),
        escapeCsv('Faculty Coordinator(s)'),
        escapeCsv('IKS Aligned'),
        escapeCsv('SDG Aligned')
      ]);

      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        csvRows.push([
          escapeCsv(c.department || ''),
          escapeCsv(c.shift || ''),
          escapeCsv(c.coordinator || '-'),
          escapeCsv(r.col2 || ''),
          escapeCsv(r.col3 || ''),
          escapeCsv(r.col4 || ''),
          escapeCsv(r.col5 || ''),
          escapeCsv(r.col6 || ''),
          escapeCsv(r.col7 || ''),
          escapeCsv(r.col8 || '')
        ]);
      });
    } else if (mode === 'B') {
      csvRows.push([
        escapeCsv('Department Name'),
        escapeCsv('Shift'),
        escapeCsv('Head / Coordinator'),
        escapeCsv('Planned Activity'),
        escapeCsv('Tentative Month'),
        escapeCsv('Faculty Assigned')
      ]);

      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        csvRows.push([
          escapeCsv(c.department || ''),
          escapeCsv(c.shift || ''),
          escapeCsv(c.coordinator || '-'),
          escapeCsv(r.col2 || ''),
          escapeCsv(r.col3 || ''),
          escapeCsv(r.col4 || '')
        ]);
      });
    } else {
      csvRows.push([
        escapeCsv('Department Name'),
        escapeCsv('Shift'),
        escapeCsv('Tentative Month'),
        escapeCsv('Activity'),
        escapeCsv('Class / Target Group'),
        escapeCsv('Faculty Coordinator')
      ]);

      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        csvRows.push([
          escapeCsv(c.department || ''),
          escapeCsv(c.shift || ''),
          escapeCsv(r.col3 || ''),
          escapeCsv(r.col2 || ''),
          escapeCsv(r.col4 || ''),
          escapeCsv(r.col5 || '')
        ]);
      });
    }

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const filename = `tentative_plan_mode_${mode.toLowerCase()}_export.csv`;
    downloadCSV(csvContent, filename);
  } catch (err) {
    console.error("CSV Export failed:", err);
    alert("Failed to export Excel: " + err.message);
  }
}

async function exportTentativePlanPDF() {
  try {
    const selectedMonth = document.getElementById('tentative-filter-month').value;
    const selectedDept = document.getElementById('tentative-filter-dept').value;
    const selectedShift = document.getElementById('tentative-filter-shift').value;
    const selectedType = document.getElementById('tentative-filter-type').value;
    const selectedAaaMonth = document.getElementById('tentative-filter-aaa-month').value;

    let mode = 'C';
    if (selectedType !== 'all') {
      mode = 'A';
    } else if (selectedAaaMonth !== 'all') {
      mode = 'B';
    }

    const filteredCats = (state.involvementCategories || []).filter(c => {
      if (selectedDept !== 'all' && c.department !== selectedDept) return false;
      if (selectedShift !== 'all' && c.shift !== selectedShift) return false;
      return true;
    });

    const isMonthMatch = (recordMonth) => {
      if (selectedMonth === 'all') return true;
      if (!recordMonth) return false;
      return recordMonth.trim().toLowerCase() === selectedMonth.trim().toLowerCase();
    };

    let recordsToDisplay = [];
    filteredCats.forEach(cat => {
      const catRecords = (state.involvementRecords || []).filter(r => r.category_id === cat.id);
      if (mode === 'A') {
        catRecords.filter(r => r.section_type === 'Conferences').forEach(r => {
          if (selectedType !== 'all' && r.col3 && r.col3.trim().toLowerCase() !== selectedType.trim().toLowerCase()) return;
          if (!isMonthMatch(r.col5)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      } else if (mode === 'B') {
        catRecords.filter(r => r.section_type === 'AAA Proposed Plan').forEach(r => {
          if (selectedAaaMonth !== 'all' && r.col3 && r.col3.trim().toLowerCase() !== selectedAaaMonth.trim().toLowerCase()) return;
          if (!isMonthMatch(r.col3)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      } else {
        catRecords.filter(r => r.section_type === 'Part B').forEach(r => {
          if (!isMonthMatch(r.col3)) return;
          recordsToDisplay.push({ category: cat, record: r });
        });
      }
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(mode === 'A' ? 'l' : 'p', 'mm', 'a4');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    const centerOffset = mode === 'A' ? 148.5 : 105;
    doc.text("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002", centerOffset, 15, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("Internal Quality Assurance Cell (IQAC)", centerOffset, 21, { align: "center" });
    
    let modeText = "Part B Academic Activities";
    if (mode === 'A') modeText = `Conferences / FDPs / Webinars (${selectedType === 'all' ? 'All' : selectedType})`;
    if (mode === 'B') modeText = `AAA Proposed Plans (${selectedAaaMonth === 'all' ? 'All' : selectedAaaMonth} Month)`;
    
    doc.text(`Tentative Department Plans Report - ${modeText}`, centerOffset, 27, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 31, mode === 'A' ? 282 : 196, 31);
    
    let tableHeaders = [];
    let tableBody = [];

    if (mode === 'A') {
      tableHeaders = [['Department', 'Shift', 'Coordinator', 'Title / Theme', 'Type', 'Nature', 'Month', 'Faculty Coordinator(s)', 'IKS', 'SDG']];
      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        tableBody.push([
          c.department || '',
          c.shift || '',
          c.coordinator || '-',
          r.col2 || '',
          r.col3 || '',
          r.col4 || '',
          r.col5 || '',
          r.col6 || '',
          r.col7 || '',
          r.col8 || ''
        ]);
      });
    } else if (mode === 'B') {
      tableHeaders = [['Department', 'Shift', 'Coordinator', 'Planned Activity', 'Month', 'Faculty Assigned']];
      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        tableBody.push([
          c.department || '',
          c.shift || '',
          c.coordinator || '-',
          r.col2 || '',
          r.col3 || '',
          r.col4 || ''
        ]);
      });
    } else {
      tableHeaders = [['Department', 'Shift', 'Month', 'Activity', 'Class / Target Group', 'Faculty Coordinator']];
      recordsToDisplay.forEach(item => {
        const c = item.category;
        const r = item.record;
        tableBody.push([
          c.department || '',
          c.shift || '',
          r.col3 || '',
          r.col2 || '',
          r.col4 || '',
          r.col5 || ''
        ]);
      });
    }

    if (tableBody.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No tentative records found matching the criteria.", 14, 40);
    } else {
      doc.autoTable({
        startY: 36,
        head: tableHeaders,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: [50, 50, 50] },
        margin: { left: 14, right: 14 }
      });
    }
    
    const filename = `tentative_plan_mode_${mode.toLowerCase()}_export.pdf`;
    doc.save(filename);
  } catch(err) {
    console.error("PDF Export failed:", err);
    alert("Failed to export PDF: " + err.message);
  }
}

function openCategoryDetailPage(categoryId) {
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
  if (deptSelect) {
    const currentVal = category.department || '';
    deptSelect.innerHTML = '<option value="">-- Select Department --</option>' + 
      [...new Set((state.departments || []).map(d => d.name))].filter(Boolean).sort()
        .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
    deptSelect.value = currentVal;
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
  if (!(await showCustomConfirm("Are you sure you want to delete this Category Card and all its records? This action is irreversible.", "Delete Category Card", "danger", "Yes, Delete"))) return;
  try {
    await fetchAPI(`/involvement/categories/${categoryId}`, { method: 'DELETE' });
    await loadInvolvementData();
    renderStaffInvolvement();
  } catch(e) {
    console.error("Failed to delete category:", e);
  }
}

async function deleteInvolvementRecord(recordId) {
  if (!(await showCustomConfirm("Are you sure you want to delete this record?", "Delete Record", "danger", "Yes, Delete"))) return;
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
    
    let targetDepts = state.departments.filter(dept => isDeptInScope(dept, scope));
    
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
  const isStaff = (state.currentUser && (state.currentUser.role === 'Staff' || state.currentUser.role === 'Director'));
  const backBtn = document.getElementById('user-plan-back-btn');
  if (backBtn) {
    backBtn.style.display = isStaff ? 'block' : 'none';
  }

  const deptInput = document.getElementById('user-plan-dept');
  if (deptInput) {
    const uniqueDepts = [...new Set((state.departments || []).map(d => d.name))].filter(Boolean).sort();
    
    // Get currently viewed category's department name
    let editDept = '';
    if (state.staffViewPlanId) {
      const cat = (state.involvementCategories || []).find(c => c.id === state.staffViewPlanId);
      if (cat && cat.department) {
        editDept = cat.department;
      }
    }
    
    // Get logged-in user's department name
    let userDept = '';
    if (state.currentUser && state.currentUser.role === 'User' && state.currentUser.name && state.currentUser.name !== 'Department User') {
      userDept = state.currentUser.name.trim();
    }
    
    const allDepts = new Set(uniqueDepts);
    if (editDept) allDepts.add(editDept);
    if (userDept) allDepts.add(userDept);
    
    const sortedDepts = [...allDepts].sort();
    
    deptInput.innerHTML = '<option value="">Select Department</option>' +
      sortedDepts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
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

  // Handle staff/admin redirecting to view/edit a plan by category ID
  if (state.staffViewPlanId) {
    const catId = state.staffViewPlanId;
    state.staffViewPlanId = null;
    loadExistingActionPlanById(catId);
    return;
  }

  // Check if current user is Staff or Director
  const isDefaultMode = !isStaff; // Lock default rows only if NOT staff/director

  // Bind change/blur listeners once to auto-load action plans
  if (!state.actionPlanListenersBound) {
    if (deptInput && shiftInput) {
      const handler = () => {
        const dept = deptInput.value;
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
        deptInput.readOnly = false;
      }
      
      if (shiftInput && matchedDept) {
        shiftInput.value = matchedDept.shift;
        shiftInput.disabled = false;
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
    addUserPlanMentorRow('', '');
  }

  document.getElementById('user-plan-clubs-body').innerHTML = '';
  document.getElementById('user-plan-conferences-body').innerHTML = '';
  document.getElementById('user-plan-aaa-body').innerHTML = '';
  
  addUserPlanClubRow();
  addUserPlanConferenceRow();
  addUserPlanAaaRow();
}

function loadActionPlanFromCategory(category) {
  if (!category) return;
  
  const isStaff = (state.currentUser && (state.currentUser.role === 'Staff' || state.currentUser.role === 'Director'));
  const isDefaultMode = !isStaff;

  const deptInput = document.getElementById('user-plan-dept');
  const shiftInput = document.getElementById('user-plan-shift');
  const coordinatorInput = document.getElementById('user-plan-coordinator');

  if (deptInput) {
    deptInput.value = category.department || '';
  }
  if (shiftInput) {
    shiftInput.value = category.shift || 'Shift 1';
  }
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
      addUserPlanMentorRow('', '');
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
}

async function loadExistingActionPlan(department, shift) {
  if (!state.involvementCategories) {
    await loadInvolvementData();
  }
  const cardName = `${department} (${shift}) Action Plan 2026-2027`;
  const category = state.involvementCategories.find(c => 
    c.name.toLowerCase() === cardName.toLowerCase() ||
    (c.department && c.department.toLowerCase() === department.toLowerCase() && c.shift && c.shift.toLowerCase() === shift.toLowerCase())
  );
  
  const isStaff = (state.currentUser && (state.currentUser.role === 'Staff' || state.currentUser.role === 'Director'));
  const isDefaultMode = !isStaff;
  
  if (category) {
    loadActionPlanFromCategory(category);
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
      addUserPlanMentorRow('', '');
    }
    document.getElementById('user-plan-clubs-body').innerHTML = '';
    document.getElementById('user-plan-conferences-body').innerHTML = '';
    document.getElementById('user-plan-aaa-body').innerHTML = '';
    
    addUserPlanClubRow();
    addUserPlanConferenceRow();
    addUserPlanAaaRow();
  }
}

async function loadExistingActionPlanById(categoryId) {
  if (!state.involvementCategories) {
    await loadInvolvementData();
  }
  const category = state.involvementCategories.find(c => c.id === categoryId);
  if (category) {
    loadActionPlanFromCategory(category);
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

function addUserPlanClubRow(sNo = '', name = '', nature = '', faculty = '') {
  const tbody = document.getElementById('user-plan-clubs-body');
  const nextSNo = sNo || (tbody.children.length + 1);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 8px;"><input type="text" class="form-control club-sno" value="${nextSNo}" style="height:32px; padding-left:6px; text-align:center;" readonly></td>
    <td style="padding: 8px;"><input type="text" class="form-control club-name" value="${name}" placeholder="Coder's Club" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control club-nature" value="${nature}" placeholder="e.g. Technical" style="height:32px; padding-left:8px; font-size: 13px;"></td>
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
    <td style="padding: 8px;"><input type="text" class="form-control conf-iks" value="${iks}" placeholder="Yes/-" style="height:32px; padding-left:8px; font-size: 13px;"></td>
    <td style="padding: 8px;"><input type="text" class="form-control conf-sdg" value="${sdg}" placeholder="Yes/-" style="height:32px; padding-left:8px; font-size: 13px;"></td>
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

async function resetUserActionPlanForm() {
  if (await showCustomConfirm("Are you sure you want to clear the form and start over?", "Reset Form", "warning", "Yes, Clear Form")) {
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

// =========================================================================
// 21. EARN WHILE YOU LEARN (EWYL) SCHEME CONTROLLER
// =========================================================================

// Initialize state variables for EWYL
state.ewylStudents = [];
state.ewylActiveMonth = localStorage.getItem('ewylActiveMonth') || getCurrentYearMonth();
state.ewylSelectedStudentId = null;
state.ewylHours = [];
state.ewylLetterData = null;

// Helper: Get current Year-Month string
function getCurrentYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Helper: Convert YYYY-MM to Month Name Year
function getMonthNameInWords(yearMonth) {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// Populate the month selectors dynamically
function populateEwylMonthDropdowns() {
  const filterSelect = document.getElementById('ewyl-month-filter');
  const setupSelect = document.getElementById('ewyl-setup-month');
  const downloadSelect = document.getElementById('ewyl-summary-download-month');
  
  if (!filterSelect || !setupSelect) return;
  
  // Generate a list from 12 months in the past to 12 months in the future
  const now = new Date();
  const options = [];
  
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const text = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    options.push({ val, text });
  }
  
  const generateOptionsHtml = () => {
    return options.map(o => `<option value="${o.val}" ${o.val === state.ewylActiveMonth ? 'selected' : ''}>${o.text}</option>`).join('');
  };
  
  const optionsHtml = generateOptionsHtml();
  filterSelect.innerHTML = optionsHtml;
  setupSelect.innerHTML = optionsHtml;
  if (downloadSelect) downloadSelect.innerHTML = optionsHtml;
}

// Switch selected month
async function changeEwylMonth(value) {
  state.ewylActiveMonth = value;
  localStorage.setItem('ewylActiveMonth', value);
  
  // Refresh summary badge in the UI
  const setupSelect = document.getElementById('ewyl-setup-month');
  if (setupSelect) setupSelect.value = value;
  
  await loadEwylDashboard();
}

// Load main EWYL Dashboard
async function loadEwylDashboard() {
  try {
    populateEwylMonthDropdowns();
    
    // Fetch summary for the active month
    const summary = await fetchAPI(`/ewyl/summary?month=${state.ewylActiveMonth}`);
    state.ewylStudents = summary || [];
    
    renderEwylDashboardTable();
  } catch (err) {
    console.error("Failed to load EWYL summary:", err);
    alert("Error loading Earn While You Learn summary: " + err.message);
  }
}

// Render EWYL dashboard table
function renderEwylDashboardTable() {
  const tbody = document.getElementById('ewyl-students-tbody');
  const emptyState = document.getElementById('ewyl-empty-state');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (state.ewylStudents.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  state.ewylStudents.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main); font-size: 13.5px;">${escapeHtml(s.reg_no)}</td>
      <td style="padding: 12px 16px; color: var(--text-main); font-size: 13.5px; font-weight: 500;">${escapeHtml(s.name)}</td>
      <td style="padding: 12px 16px; color: var(--text-muted); font-size: 13px;">${escapeHtml(s.dept_name)}</td>
      <td style="padding: 12px 16px; text-align: center; color: var(--text-main); font-size: 13.5px; font-weight: 600;">${Number(s.total_hours).toFixed(2)} hrs</td>
      <td style="padding: 12px 16px; text-align: right; color: var(--primary); font-size: 13.5px; font-weight: bold;">Rs. ${Number(s.remuneration).toLocaleString()}</td>
      <td style="padding: 12px 16px; text-align: center;">
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button class="btn btn-primary btn-xs" onclick="goToAddHours(${s.id})" style="padding: 6px 10px; display: flex; align-items: center; gap: 4px; border-radius: 6px;" title="Add working hours">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Hours
          </button>
          <button class="btn btn-secondary btn-xs" onclick="viewEwylStudentData(${s.id})" style="padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="View Student profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </button>
          <button class="btn btn-secondary btn-xs" onclick="openEditStudentModal(${s.id})" style="padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="Edit Student profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="btn btn-danger btn-xs" onclick="deleteEwylStudent(${s.id})" style="padding: 6px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" title="Delete Student profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Open register student modal
function openAddStudentModal() {
  document.getElementById('ewyl-student-modal-title').innerText = 'Register Student';
  document.getElementById('ewyl-student-submit-btn').innerText = 'Register Student';
  document.getElementById('ewyl-student-edit-id').value = '';
  document.getElementById('ewyl-student-form').reset();
  document.getElementById('ewyl-student-modal').classList.add('open');
}

// Close register student modal
function closeEwylStudentModal() {
  document.getElementById('ewyl-student-modal').classList.remove('open');
}

// Open edit student modal
function openEditStudentModal(id) {
  const student = state.ewylStudents.find(s => s.id === id);
  if (!student) return;
  
  document.getElementById('ewyl-student-modal-title').innerText = 'Edit Student Profile';
  document.getElementById('ewyl-student-submit-btn').innerText = 'Save Changes';
  document.getElementById('ewyl-student-edit-id').value = student.id;
  
  document.getElementById('ewyl-student-name').value = student.name;
  document.getElementById('ewyl-student-reg').value = student.reg_no;
  document.getElementById('ewyl-student-dept').value = student.dept_name;
  document.getElementById('ewyl-student-bank').value = student.bank_name;
  document.getElementById('ewyl-student-account').value = student.account_no;
  document.getElementById('ewyl-student-ifsc').value = student.ifsc_code;
  document.getElementById('ewyl-student-branch').value = student.branch_name;
  
  document.getElementById('ewyl-student-modal').classList.add('open');
}

// Save student profile (insert or update)
async function saveEwylStudent(e) {
  e.preventDefault();
  
  const id = document.getElementById('ewyl-student-edit-id').value;
  const payload = {
    name: document.getElementById('ewyl-student-name').value.trim(),
    reg_no: document.getElementById('ewyl-student-reg').value.trim().toUpperCase(),
    dept_name: document.getElementById('ewyl-student-dept').value.trim(),
    bank_name: document.getElementById('ewyl-student-bank').value.trim(),
    account_no: document.getElementById('ewyl-student-account').value.trim(),
    ifsc_code: document.getElementById('ewyl-student-ifsc').value.trim().toUpperCase(),
    branch_name: document.getElementById('ewyl-student-branch').value.trim()
  };
  
  try {
    const isEdit = !!id;
    const url = isEdit ? `/ewyl/students/${id}` : '/ewyl/students';
    const method = isEdit ? 'PUT' : 'POST';
    
    await fetchAPI(url, {
      method,
      body: JSON.stringify(payload)
    });
    
    closeEwylStudentModal();
    alert(isEdit ? "Student profile updated successfully!" : "Student registered successfully!");
    await loadEwylDashboard();
  } catch (err) {
    console.error("Failed to save student details:", err);
    alert(err.message);
  }
}

// View student bank details
function viewEwylStudentData(id) {
  const student = state.ewylStudents.find(s => s.id === id);
  if (!student) return;
  
  const message = `Student Registration No: ${student.reg_no}
Full Name: ${student.name}
Department: ${student.dept_name}

-- BANK DETAILS --
Bank Name: ${student.bank_name}
Account Number: ${student.account_no}
IFSC Code: ${student.ifsc_code}
Branch Name: ${student.branch_name}`;
  
  showCustomDialog({
    title: "Student Profile Details",
    message: message,
    type: "info",
    confirmText: "Close"
  });
}

// Delete student profile
async function deleteEwylStudent(id) {
  const student = state.ewylStudents.find(s => s.id === id);
  if (!student) return;
  
  if (await showCustomConfirm(
    `Are you sure you want to delete the student ${student.name} (${student.reg_no})? All their recorded working hours for all months will be permanently deleted!`,
    "Delete Student Profile",
    "danger",
    "Yes, Delete"
  )) {
    try {
      await fetchAPI(`/ewyl/students/${id}`, { method: 'DELETE' });
      alert("Student profile deleted successfully.");
      await loadEwylDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to delete student profile: " + err.message);
    }
  }
}

// --- HOURS LOG LOGIC ---

// Go to Add Hours Page
async function goToAddHours(studentId) {
  state.ewylSelectedStudentId = studentId;
  switchSubView('staff-ewyl-hours');
}

// Handles time input mode switching
function toggleEwylHoursTimeMode() {
  const mode = document.querySelector('input[name="ewyl-time-mode"]:checked').value;
  const dateInput = document.getElementById('ewyl-log-date');
  const inInput = document.getElementById('ewyl-log-in');
  const outInput = document.getElementById('ewyl-log-out');
  
  if (!dateInput || !inInput || !outInput) return;
  
  if (mode === 'current') {
    const now = new Date();
    
    // YYYY-MM-DD
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateInput.value = `${y}-${m}-${d}`;
    
    // Set IN and OUT
    inInput.value = "09:00";
    outInput.value = "17:00";
    
    dateInput.readOnly = true;
    inInput.readOnly = true;
    outInput.readOnly = true;
  } else {
    // Manual mode
    dateInput.readOnly = false;
    inInput.readOnly = false;
    outInput.readOnly = false;
    
    dateInput.value = '';
    inInput.value = '09:00';
    outInput.value = '17:00';
  }
}

// Load hours log page for active student
async function renderEwylHoursLogPage() {
  const student = state.ewylStudents.find(s => s.id === state.ewylSelectedStudentId);
  if (!student) {
    switchSubView('staff-ewyl');
    return;
  }
  
  // Set student banner texts
  document.getElementById('ewyl-hours-student-name').innerText = `${student.name} (${student.reg_no})`;
  document.getElementById('ewyl-hours-student-dept').innerText = student.dept_name;
  
  const monthWords = getMonthNameInWords(state.ewylActiveMonth);
  document.getElementById('ewyl-hours-active-month-badge').innerText = `Active Month: ${monthWords}`;
  
  // Reset form time inputs
  document.getElementById('ewyl-hours-form').reset();
  if (document.getElementById('ewyl-log-work-done')) {
    document.getElementById('ewyl-log-work-done').value = '';
  }
  toggleEwylHoursTimeMode();
  
  // Setup listeners for live duration calculation
  const inTimeInput = document.getElementById('ewyl-log-in');
  const outTimeInput = document.getElementById('ewyl-log-out');
  if (inTimeInput && outTimeInput) {
    inTimeInput.onchange = calculateLiveEwylDuration;
    outTimeInput.onchange = calculateLiveEwylDuration;
    inTimeInput.oninput = calculateLiveEwylDuration;
    outTimeInput.oninput = calculateLiveEwylDuration;
  }
  calculateLiveEwylDuration();
  
  try {
    // Fetch hours
    const hours = await fetchAPI(`/ewyl/hours?student_id=${student.id}&month=${state.ewylActiveMonth}`);
    state.ewylHours = hours || [];
    
    renderEwylHoursLogTable();
  } catch (err) {
    console.error("Failed to load hours logs:", err);
    alert("Error loading hours logs: " + err.message);
  }
}

// Render hours log table
function renderEwylHoursLogTable() {
  const tbody = document.getElementById('ewyl-hours-tbody');
  const empty = document.getElementById('ewyl-hours-empty');
  const totalSumEl = document.getElementById('ewyl-hours-total-sum');
  
  const statsHoursEl = document.getElementById('ewyl-stats-hours');
  const statsMoneyEl = document.getElementById('ewyl-stats-money');
  
  if (!tbody) return;
  tbody.innerHTML = '';
  
  let totalSum = 0;
  
  if (state.ewylHours.length === 0) {
    empty.style.display = 'block';
    totalSumEl.innerText = '0.00 hrs';
    statsHoursEl.innerText = '0.00 hrs';
    statsMoneyEl.innerText = 'Rs. 0.00';
    return;
  }
  
  empty.style.display = 'none';
  
  state.ewylHours.forEach(h => {
    totalSum += Number(h.total_hours);
    const tr = document.createElement('tr');
    
    let formattedDate = h.date;
    try {
      const parts = h.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    } catch(e) {}
    
    tr.innerHTML = `
      <td style="padding: 10px 16px; font-weight: 500; color: var(--text-main);">${formattedDate}</td>
      <td style="padding: 10px 16px; text-align: center; color: var(--text-main);">${h.in_time}</td>
      <td style="padding: 10px 16px; text-align: center; color: var(--text-main);">${h.out_time}</td>
      <td style="padding: 10px 16px; text-align: center; font-weight: 600; color: var(--primary);">${Number(h.total_hours).toFixed(2)} hrs</td>
      <td style="padding: 10px 16px; color: var(--text-muted); font-size: 12.5px;">${escapeHtml(h.work_done || '-')}</td>
      <td style="padding: 10px 16px; text-align: center;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <button class="btn btn-secondary btn-xs btn-icon" onclick="openEditEwylHoursLog(${h.id})" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px;" title="Edit log entry">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="btn btn-danger btn-xs btn-icon" onclick="deleteEwylHoursLog(${h.id})" style="padding: 6px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px;" title="Delete log entry">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  totalSumEl.innerText = `${totalSum.toFixed(2)} hrs`;
  statsHoursEl.innerText = `${totalSum.toFixed(2)} hrs`;
  statsMoneyEl.innerText = `Rs. ${(totalSum * 40).toLocaleString()}`;
}

function openEditEwylHoursLog(id) {
  const h = (state.ewylHours || []).find(log => log.id == id);
  if (!h) return;

  document.getElementById('ewyl-log-edit-id').value = h.id;
  document.getElementById('ewyl-log-date').value = h.date || '';
  document.getElementById('ewyl-log-in').value = h.in_time || '';
  document.getElementById('ewyl-log-out').value = h.out_time || '';
  
  const workDoneEl = document.getElementById('ewyl-log-work-done');
  if (workDoneEl) {
    workDoneEl.value = h.work_done || '';
  }

  // Update submit button text to indicate editing
  const submitBtn = document.querySelector('#ewyl-hours-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.innerText = 'Update Hours Entry';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-success');
    
    // Add cancel button if not present
    let cancelBtn = document.getElementById('ewyl-hours-edit-cancel');
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'ewyl-hours-edit-cancel';
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.style.width = '100%';
      cancelBtn.style.marginTop = '8px';
      cancelBtn.innerText = 'Cancel Edit';
      cancelBtn.onclick = resetEwylHoursForm;
      submitBtn.parentNode.appendChild(cancelBtn);
    }
  }
}

function resetEwylHoursForm() {
  document.getElementById('ewyl-hours-form').reset();
  document.getElementById('ewyl-log-edit-id').value = '';
  
  const submitBtn = document.querySelector('#ewyl-hours-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.innerText = 'Record Hours Entry';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-primary');
  }
  
  const cancelBtn = document.getElementById('ewyl-hours-edit-cancel');
  if (cancelBtn) {
    cancelBtn.remove();
  }
  
  const durationPreview = document.getElementById('ewyl-duration-calc-preview');
  if (durationPreview) {
    durationPreview.innerText = '';
  }
}

// Save working hours log
async function saveEwylHoursLog(e) {
  e.preventDefault();
  
  const student = state.ewylStudents.find(s => s.id === state.ewylSelectedStudentId);
  if (!student) return;
  
  const dateVal = document.getElementById('ewyl-log-date').value;
  const inVal = document.getElementById('ewyl-log-in').value;
  const outVal = document.getElementById('ewyl-log-out').value;
  const workDoneVal = document.getElementById('ewyl-log-work-done') ? document.getElementById('ewyl-log-work-done').value.trim() : '';
  
  if (!dateVal || !inVal || !outVal) {
    alert("Please enter date, IN and OUT times.");
    return;
  }
  
  // Make sure the log date matches the active month year
  const logMonth = dateVal.substring(0, 7); // "YYYY-MM"
  if (logMonth !== state.ewylActiveMonth) {
    alert(`The selected date falls under ${getMonthNameInWords(logMonth)}. Please record work done only for the active month: ${getMonthNameInWords(state.ewylActiveMonth)}.`);
    return;
  }
  
  const payload = {
    student_id: student.id,
    date: dateVal,
    in_time: inVal,
    out_time: outVal,
    month_active: state.ewylActiveMonth,
    work_done: workDoneVal
  };
  
  const id = document.getElementById('ewyl-log-edit-id').value;
  
  try {
    if (id) {
      await fetchAPI(`/ewyl/hours/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      alert("Hours log updated successfully.");
    } else {
      await fetchAPI('/ewyl/hours', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert("Hours log recorded successfully.");
    }
    
    resetEwylHoursForm();
    await renderEwylHoursLogPage();
  } catch (err) {
    console.error("Failed to log hours:", err);
    alert(err.message || "Failed to save entry. Check IN and OUT time coherence.");
  }
}

// Delete hours log entry
async function deleteEwylHoursLog(id) {
  if (await showCustomConfirm("Are you sure you want to delete this working hours entry?", "Delete Hours Entry", "danger", "Yes, Delete")) {
    try {
      await fetchAPI(`/ewyl/hours/${id}`, { method: 'DELETE' });
      alert("Entry deleted successfully.");
      await renderEwylHoursLogPage();
    } catch (err) {
      console.error(err);
      alert("Failed to delete log entry: " + err.message);
    }
  }
}

// --- CLAIM LETTER SETUP & RENDER ---

// Open claim letter selection dialog modal
async function openClaimLetterSetupModal() {
  const monthSelect = document.getElementById('ewyl-setup-month');
  if (monthSelect) monthSelect.value = state.ewylActiveMonth;
  
  await loadClaimSetupStudents(state.ewylActiveMonth);
  document.getElementById('ewyl-claim-setup-modal').classList.add('open');
}

// Close modal
function closeClaimLetterSetupModal() {
  document.getElementById('ewyl-claim-setup-modal').classList.remove('open');
}

// Select all/none checkboxes
function toggleSetupStudentSelection(checked) {
  document.querySelectorAll('#ewyl-setup-students-list input[type="checkbox"]').forEach(cb => {
    cb.checked = checked;
  });
}

// Load students checklist list based on selected month
async function loadClaimSetupStudents(month) {
  const container = document.getElementById('ewyl-setup-students-list');
  if (!container) return;
  
  container.innerHTML = 'Loading students summary...';
  
  try {
    const summary = await fetchAPI(`/ewyl/summary?month=${month}`);
    container.innerHTML = '';
    
    if (!summary || summary.length === 0) {
      container.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">No registered students.</span>';
      return;
    }
    
    summary.forEach(s => {
      const isDisabled = Number(s.total_hours) === 0;
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';
      label.style.fontSize = '13.5px';
      label.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
      label.style.color = isDisabled ? 'var(--text-muted)' : 'var(--text-main)';
      
      label.innerHTML = `
        <input type="checkbox" value="${s.id}" data-hours="${s.total_hours}" ${isDisabled ? 'disabled' : 'checked'}>
        <div>
          <strong>${escapeHtml(s.name)}</strong> (${escapeHtml(s.reg_no)})
          <span style="font-size: 11.5px; color: ${isDisabled ? 'var(--text-muted)' : 'var(--primary)'}; font-weight: 500;">
            - ${Number(s.total_hours).toFixed(2)} hours logged (Rs. ${s.remuneration})
          </span>
        </div>
      `;
      container.appendChild(label);
    });
  } catch (err) {
    container.innerHTML = `<span style="color: var(--danger); font-size:12px;">Failed to load: ${err.message}</span>`;
  }
}

// Generate the claim letterpad view
async function generateClaimLetter(e) {
  e.preventDefault();
  
  const monthVal = document.getElementById('ewyl-setup-month').value;
  const checkedBoxes = Array.from(document.querySelectorAll('#ewyl-setup-students-list input[type="checkbox"]:checked'));
  
  if (checkedBoxes.length === 0) {
    alert("Please select at least one student with logged hours to include in the claim letter.");
    return;
  }
  
  const selectedIds = checkedBoxes.map(cb => parseInt(cb.value));
  
  try {
    const summary = await fetchAPI(`/ewyl/summary?month=${monthVal}`);
    const selectedStudents = summary.filter(s => selectedIds.includes(s.id));
    
    closeClaimLetterSetupModal();
    
    // Set up active letter data
    state.ewylLetterData = {
      month: monthVal,
      students: selectedStudents
    };
    
    // Populate Editable Letterpad Template Fields
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    document.getElementById('letter-date').innerText = `${d}.${m}.${y}`;
    
    document.getElementById('letter-to-address').innerHTML = `Rev. Fr. Principal<br>St. Joseph's College (Autonomous)<br>Tiruchirappalli-2`;
    document.getElementById('letter-subject').innerHTML = `Sub: Remuneration for IQAC work – <strong>Earn while you Learn Scheme</strong> - Reg.`;
    
    const [yearNum, monthNum] = monthVal.split('-').map(Number);
    const startYear = monthNum >= 6 ? yearNum : yearNum - 1;
    const endYear = startYear + 1;
    document.getElementById('letter-body-text').innerText = `Kindly sanction remuneration for the work done by the following Students for preparation of Newsletter for the year ${startYear}-${endYear}.`;
    
    // Populate table
    const tableBody = document.getElementById('letter-table-tbody');
    tableBody.innerHTML = '';
    
    let grandTotal = 0;
    
    selectedStudents.forEach((s, idx) => {
      grandTotal += s.remuneration;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${idx + 1}</td>
        <td>${escapeHtml(s.name)}<br>(${escapeHtml(s.reg_no)})</td>
        <td>${escapeHtml(s.dept_name)}</td>
        <td style="text-align: center;">40</td>
        <td style="text-align: center;">${Number(s.total_hours).toFixed(0)}</td>
        <td style="text-align: right; font-weight: bold;">${s.remuneration.toLocaleString()}</td>
        <td style="font-size: 11px; max-width: 200px;">
          Account Number: ${escapeHtml(s.account_no)}<br>
          Bank Name: ${escapeHtml(s.bank_name)}<br>
          IFSC: ${escapeHtml(s.ifsc_code)} &nbsp; Branch: ${escapeHtml(s.branch_name)}
        </td>
      `;
      tableBody.appendChild(tr);
    });
    
    // Add Total row
    const totalTr = document.createElement('tr');
    totalTr.style.fontWeight = 'bold';
    totalTr.style.background = '#f8fafc';
    totalTr.innerHTML = `
      <td colspan="5" style="text-align: right; font-size:14px;">Total</td>
      <td style="text-align: right; font-size:14px; color: var(--primary);">${grandTotal.toLocaleString()}</td>
      <td></td>
    `;
    tableBody.appendChild(totalTr);
    
    // Convert total to words
    const amountInWords = numberToRupeesInWords(grandTotal);
    document.getElementById('letter-amount-words').innerText = `Rupees ${amountInWords} Only.`;
    
    // Switch to letter view
    switchSubView('staff-ewyl-letter');
  } catch (err) {
    console.error("Failed to generate letter:", err);
    alert("Error generating claim letter: " + err.message);
  }
}

// Convert Number to Rupees in Words Helper
function numberToRupeesInWords(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanOneThousand(n) {
    if (n === 0) return '';
    let temp = '';
    
    if (n >= 100) {
      temp += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      temp += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    
    if (n > 0) {
      temp += ones[n] + ' ';
    }
    
    return temp.trim();
  }
  
  let result = '';
  
  if (num >= 100000) {
    result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  if (num > 0) {
    result += convertLessThanOneThousand(num);
  }
  
  return result.replace(/\s+/g, ' ').trim();
}

// --- CLAIM LETTER EXPORTS (Word / PDF) ---

// Word (.doc) Export
function exportClaimLetterWord() {
  const container = document.getElementById('claim-letter-document');
  if (!container) return;
  
  const date = document.getElementById('letter-date').innerText.trim();
  const address = document.getElementById('letter-to-address').innerHTML.trim();
  const salutation = document.getElementById('letter-salutation').innerText.trim();
  const subject = document.getElementById('letter-subject').innerHTML.trim();
  const bodyText = document.getElementById('letter-body-text').innerText.trim();
  const tableHtml = document.querySelector('.letter-table').outerHTML;
  const amountWords = document.getElementById('letter-amount-words').innerText.trim();
  const closing = document.getElementById('letter-closing').innerText.trim();
  const sigLeft = document.getElementById('letter-sig-left').innerHTML.trim();
  const sigRight = document.getElementById('letter-sig-right').innerHTML.trim();
  
  let logoBase64 = "";
  const logoImg = document.querySelector('.letter-header-logo');
  if (logoImg) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.naturalWidth || logoImg.width;
      canvas.height = logoImg.naturalHeight || logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(logoImg, 0, 0);
      logoBase64 = canvas.toDataURL('image/png');
    } catch(e) {
      console.warn("Could not base64 encode logo for Word doc:", e);
    }
  }

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Claim Letter</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          margin: 1in;
          color: #000000;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        .header-table td {
          border: none !important;
          padding: 0 !important;
        }
        .logo-img {
          width: 75px;
          height: 130px;
        }
        .header-text {
          text-align: center;
          line-height: 1.3;
        }
        .header-text h2 {
          font-size: 11pt;
          margin: 0;
          font-weight: bold;
        }
        .header-text h1 {
          font-size: 16pt;
          margin: 2px 0 5px 0;
          font-weight: bold;
        }
        .header-text p {
          font-size: 9pt;
          margin: 1px 0;
        }
        .header-divider {
          border-top: 1px solid #000000;
          border-bottom: 3.5px solid #000000;
          height: 3px;
          margin: 6px 0 25px 0;
        }
        .letter-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .letter-table th, .letter-table td {
          border: 1px solid #000000;
          padding: 6px 8px;
          font-size: 9.5pt;
        }
        .letter-table th {
          font-weight: bold;
          text-align: center;
          background-color: #f2f2f2;
        }
        .signatures-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 50px;
        }
        .signatures-table td {
          border: none !important;
          width: 50%;
          text-align: center;
          font-weight: bold;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table" style="width: 100%; border-collapse: collapse; border: none !important;">
        <tr>
          <td style="width: 90px; vertical-align: top; border: none !important;">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Logo" style="width: 75px; height: 130px;">` : '[Logo]'}
          </td>
          <td style="vertical-align: top; border: none !important; text-align: center;">
            <div class="header-text" style="text-align: center; line-height: 1.3;">
              <h2 style="font-size: 11pt; font-weight: bold; margin: 0; font-family: 'Times New Roman', Times, serif; text-align: center;">INTERNAL QUALITY ASSURANCE CELL</h2>
              <h1 style="font-size: 15pt; font-weight: bold; margin: 3px 0 5px 0; font-family: 'Times New Roman', Times, serif; text-align: center;">ST. JOSEPH'S COLLEGE (AUTONOMOUS)</h1>
              
              <!-- Centered 2-column table for accreditation details in Word -->
              <table style="margin: 3px auto; border-collapse: collapse; border: none !important; width: auto; font-family: 'Times New Roman', Times, serif; font-size: 8.5pt; font-weight: bold; color: #000; line-height: 1.4;">
                <tr>
                  <td style="border: none !important; padding: 0 15px 0 0 !important; text-align: left; white-space: nowrap;">Accredited at A++ Grade (Cycle IV) by NAAC</td>
                  <td style="border: none !important; padding: 0 0 0 15px !important; text-align: left; white-space: nowrap;">Special Heritage College Status awarded by UGC</td>
                </tr>
                <tr>
                  <td style="border: none !important; padding: 0 15px 0 0 !important; text-align: left; white-space: nowrap;">College with Potential for Excellence by UGC</td>
                  <td style="border: none !important; padding: 0 0 0 15px !important; text-align: left; white-space: nowrap;">DBT-STAR &amp; DST-FIST Sponsored College</td>
                </tr>
              </table>
              
              <p style="font-size: 10pt; font-weight: bold; margin: 3px 0 1px 0; text-align: center;">TIRUCHIRAPPALLI - 620 002</p>
              <p style="font-size: 8.5pt; margin: 1px 0; text-align: center;">Email: iqaccoor@mail.sjctni.edu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; website: www.sjctni.edu</p>
            </div>
          </td>
          <td style="width: 90px; border: none !important;">
            <!-- Empty balance cell -->
          </td>
        </tr>
      </table>
      <div class="header-divider"></div>

      <div style="text-align: right; margin-bottom: 25px;">${date}</div>

      <div style="margin-bottom: 25px;">
        To<br>
        <div style="margin-left: 20px;">${address}</div>
      </div>

      <div style="margin-bottom: 18px;">${salutation}</div>

      <div style="margin-bottom: 20px; font-weight: bold; padding-left: 30px; text-indent: -30px;">
        ${subject}
      </div>

      <div style="margin-bottom: 20px; text-indent: 30px; text-align: justify;">
        ${bodyText}
      </div>

      ${tableHtml}

      <div style="margin-bottom: 30px; font-weight: bold;">
        Rupees in Words: ${amountWords}
      </div>

      <div style="margin-bottom: 40px;">
        ${closing}
      </div>

      <table class="signatures-table">
        <tr>
          <td style="text-align: left; padding-left: 20px;">
            ${sigLeft}
          </td>
          <td style="text-align: right; padding-right: 20px;">
            ${sigRight}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const monthName = state.ewylLetterData ? state.ewylLetterData.month : 'summary';
  link.setAttribute("href", url);
  link.setAttribute("download", `ewyl_claim_letter_${monthName}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Export using jsPDF and AutoTable
async function exportClaimLetterPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const marginX = 15;
    let currentY = 15;
    
    // 1. Draw Crest Logo
    const logoImg = document.querySelector('.letter-header-logo');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width;
        canvas.height = logoImg.naturalHeight || logoImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', marginX, currentY - 3, 25, 29);
      } catch(e) {
        console.warn("Could not embed logo in PDF:", e);
      }
    }
    
    // 2. Draw Header Text
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("INTERNAL QUALITY ASSURANCE CELL", 105, currentY + 3, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(15);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 105, currentY + 8, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Accredited at A++ Grade (Cycle IV) by NAAC", 35, currentY + 12);
    doc.text("Special Heritage College Status awarded by UGC", 112, currentY + 12);
    
    doc.text("College with Potential for Excellence by UGC", 35, currentY + 15);
    doc.text("DBT-STAR & DST-FIST Sponsored College", 112, currentY + 15);
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10.5);
    doc.text("TIRUCHIRAPPALLI - 620 002", 105, currentY + 19, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Email: iqaccoor@mail.sjctni.edu               website: www.sjctni.edu", 105, currentY + 22.5, { align: "center" });
    
    currentY += 25;
    
    // 3. Double Line Divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    doc.setLineWidth(1.1);
    doc.line(marginX, currentY + 0.9, 210 - marginX, currentY + 0.9);
    
    currentY += 8;
    
    // 4. Date
    const dateText = document.getElementById('letter-date').innerText.trim();
    doc.setFont("Times", "normal");
    doc.setFontSize(11);
    doc.text(dateText, 210 - marginX, currentY, { align: "right" });
    
    currentY += 8;
    
    // 5. To Recipient
    const addressText = document.getElementById('letter-to-address').innerText.trim();
    doc.text("To", marginX, currentY);
    currentY += 5;
    
    const addressLines = addressText.split('\n');
    addressLines.forEach(line => {
      doc.text(line.trim(), marginX + 6, currentY);
      currentY += 5;
    });
    
    currentY += 4;
    
    // 6. Salutation
    const salutationText = document.getElementById('letter-salutation').innerText.trim();
    doc.text(salutationText, marginX, currentY);
    
    currentY += 8;
    
    // 7. Subject
    const subjectText = document.getElementById('letter-subject').innerText.trim();
    const wrappedSubject = doc.splitTextToSize(subjectText, 210 - (marginX * 2) - 10);
    doc.setFont("Times", "bold");
    
    wrappedSubject.forEach((line, index) => {
      doc.text(line, marginX + (index === 0 ? 0 : 10), currentY);
      currentY += 5.5;
    });
    
    currentY += 3;
    
    // 8. Body Text
    const bodyText = document.getElementById('letter-body-text').innerText.trim();
    const wrappedBody = doc.splitTextToSize(bodyText, 210 - (marginX * 2));
    doc.setFont("Times", "normal");
    
    wrappedBody.forEach(line => {
      doc.text(line, marginX, currentY);
      currentY += 6;
    });
    
    currentY += 4;
    
    // 9. Table of Students Remuneration
    const tableHeaders = [['S. No', 'Name of the Student & Reg. No', 'Department', 'Amount\n/Hour', 'No. of\nHours', 'Amount\n(Rs)', 'Bank Details']];
    const tableRows = [];
    
    const tableElRows = Array.from(document.querySelectorAll('.letter-table tbody tr'));
    const studentRows = tableElRows.slice(0, -1);
    const totalRow = tableElRows[tableElRows.length - 1];
    
    studentRows.forEach(row => {
      const tds = Array.from(row.querySelectorAll('td'));
      tableRows.push([
        tds[0].innerText.trim(),
        tds[1].innerText.trim(),
        tds[2].innerText.trim(),
        tds[3].innerText.trim(),
        tds[4].innerText.trim(),
        tds[5].innerText.trim(),
        tds[6].innerText.trim()
      ]);
    });
    
    const totalTds = Array.from(totalRow.querySelectorAll('td'));
    const totalAmount = totalTds[1].innerText.trim();
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'Times',
        fontSize: 8.5,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [245, 245, 245],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', width: 10 },
        3: { halign: 'center', width: 15 },
        4: { halign: 'center', width: 15 },
        5: { halign: 'right', fontStyle: 'bold', width: 20 }
      },
      didDrawPage: function(data) {
        currentY = data.cursor.y;
      }
    });
    
    currentY += 3;
    
    // Draw Custom Total Row
    doc.setLineWidth(0.15);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    
    doc.setFont("Times", "bold");
    doc.text("Total", 100, currentY + 5);
    doc.text(totalAmount, 120, currentY + 5, { align: "right" });
    
    doc.line(marginX, currentY + 7, 210 - marginX, currentY + 7);
    
    currentY += 15;
    
    // 10. Amount in words
    const amountWordsText = document.getElementById('letter-amount-words').innerText.trim();
    doc.setFont("Times", "bold");
    doc.text(amountWordsText, marginX, currentY);
    
    currentY += 10;
    
    // 11. Closing
    const closingText = document.getElementById('letter-closing').innerText.trim();
    doc.setFont("Times", "normal");
    doc.text(closingText, marginX, currentY);
    
    currentY += 25;
    
    // 12. Signatures
    const sigLeftText = document.getElementById('letter-sig-left').innerText.trim();
    const sigRightText = document.getElementById('letter-sig-right').innerText.trim();
    
    doc.setFont("Times", "bold");
    
    const leftSigLines = sigLeftText.split('\n');
    let leftSigY = currentY;
    leftSigLines.forEach(line => {
      doc.text(line.trim(), marginX + 5, leftSigY);
      leftSigY += 5;
    });
    
    const rightSigLines = sigRightText.split('\n');
    let rightSigY = currentY;
    rightSigLines.forEach(line => {
      doc.text(line.trim(), 210 - marginX - 5, rightSigY, { align: "right" });
      rightSigY += 5;
    });
    
    const monthName = state.ewylLetterData ? state.ewylLetterData.month : 'summary';
    doc.save(`ewyl_claim_letter_${monthName}.pdf`);
  } catch(err) {
    console.error("PDF generation failed:", err);
    alert("Failed to generate PDF: " + err.message);
  }
}

// ================= MONTH SUMMARY REPORT DOWNLOADS =================

function openMonthSummaryModal() {
  const downloadSelect = document.getElementById('ewyl-summary-download-month');
  if (downloadSelect) downloadSelect.value = state.ewylActiveMonth;
  document.getElementById('ewyl-month-summary-modal').classList.add('open');
}

function closeMonthSummaryModal() {
  document.getElementById('ewyl-month-summary-modal').classList.remove('open');
}

async function downloadMonthSummary(format) {
  const monthVal = document.getElementById('ewyl-summary-download-month').value;
  if (!monthVal) {
    alert("Please select a target month.");
    return;
  }
  
  try {
    const summary = await fetchAPI(`/ewyl/summary?month=${monthVal}`);
    if (!summary || summary.length === 0) {
      alert("No student hours data recorded for the selected month.");
      return;
    }
    
    // Fetch detailed daily logs for person-by-person compilation
    const dailyLogs = await fetchAPI(`/ewyl/hours?month=${monthVal}`);
    
    closeMonthSummaryModal();
    
    if (format === 'word') {
      await downloadMonthSummaryWord(monthVal, summary, dailyLogs);
    } else {
      await downloadMonthSummaryPDF(monthVal, summary, dailyLogs);
    }
  } catch (err) {
    console.error("Failed to download month summary:", err);
    alert("Error downloading month summary report: " + err.message);
  }
}

// Punch time function
function punchEwylTime(type) {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${h}:${m}`;
  
  const dateInput = document.getElementById('ewyl-log-date');
  const inInput = document.getElementById('ewyl-log-in');
  const outInput = document.getElementById('ewyl-log-out');
  
  if (dateInput && !dateInput.value) {
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateInput.value = `${y}-${mo}-${d}`;
  }
  
  if (type === 'in' && inInput) {
    inInput.value = timeStr;
  } else if (type === 'out' && outInput) {
    outInput.value = timeStr;
  }
  
  calculateLiveEwylDuration();
}

// Live calculation
function calculateLiveEwylDuration() {
  const inVal = document.getElementById('ewyl-log-in').value;
  const outVal = document.getElementById('ewyl-log-out').value;
  const previewEl = document.getElementById('ewyl-duration-calc-preview');
  
  if (!previewEl) return;
  
  if (!inVal || !outVal) {
    previewEl.innerText = '';
    return;
  }
  
  const [inH, inM] = inVal.split(':').map(Number);
  const [outH, outM] = outVal.split(':').map(Number);
  
  const inMins = inH * 60 + inM;
  const outMins = outH * 60 + outM;
  
  if (outMins <= inMins) {
    previewEl.innerHTML = `<span style="color: var(--danger);">Error: OUT time must be after IN time</span>`;
    return;
  }
  
  const diffMins = outMins - inMins;
  const diffHrs = diffMins / 60;
  const hours = Math.floor(diffHrs);
  const mins = diffMins % 60;
  
  previewEl.innerHTML = `Live Calculator: <strong>${hours}h ${mins}m</strong> (${diffHrs.toFixed(2)} hrs)`;
}

// Word Export for Month Summary
async function downloadMonthSummaryWord(monthVal, summary, dailyLogs) {
  const monthName = getMonthNameInWords(monthVal);
  const activeStudents = (summary || []).filter(s => s.total_hours > 0);
  
  let grandTotalHours = 0;
  let grandTotalRemuneration = 0;
  
  const studentsContentHtml = activeStudents.map((s, idx) => {
    grandTotalHours += s.total_hours;
    grandTotalRemuneration += s.remuneration;
    
    const studentLogs = (dailyLogs || []).filter(l => l.student_id === s.id);
    const logRowsHtml = studentLogs.map((log, lIdx) => {
      let dateStr = log.date || '';
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${lIdx + 1}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${escapeHtml(dateStr)}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${escapeHtml(log.in_time)}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${escapeHtml(log.out_time)}</td>
          <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${Number(log.total_hours).toFixed(2)}</td>
          <td style="border: 1px solid #000000; padding: 4px; font-size: 9pt;">${escapeHtml(log.work_done || '-')}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
          <tr>
            <td style="font-weight: bold; font-size: 10.5pt; width: 60%; border: none !important;">
              ${idx + 1}. Student Name: <span style="text-decoration: underline;">${escapeHtml(s.name)}</span> (${escapeHtml(s.reg_no)})
            </td>
            <td style="font-weight: bold; font-size: 10.5pt; text-align: right; border: none !important;">
              Dept: ${escapeHtml(s.dept_name)}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 9.5pt; color: #333333; padding-top: 2px; border: none !important;">
              <strong>Bank Details:</strong> A/C: ${escapeHtml(s.account_no)} | Bank: ${escapeHtml(s.bank_name)} | IFSC: ${escapeHtml(s.ifsc_code)} | Branch: ${escapeHtml(s.branch_name)}
            </td>
          </tr>
        </table>
        
        <table class="letter-table" style="margin-top: 5px; margin-bottom: 5px; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="width: 8%; font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">S.No</th>
              <th style="width: 15%; font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">Date</th>
              <th style="width: 12%; font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">IN Time</th>
              <th style="width: 12%; font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">OUT Time</th>
              <th style="width: 15%; font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">Hours</th>
              <th style="font-size: 9pt; padding: 4px; border: 1px solid #000000; font-weight: bold; text-align: center;">Work Done</th>
            </tr>
          </thead>
          <tbody>
            ${logRowsHtml || '<tr><td colspan="6" style="text-align: center; border: 1px solid #000000; padding: 6px;">No daily logs recorded.</td></tr>'}
            <tr style="font-weight: bold; background-color: #f2f2f2;">
              <td colspan="4" style="text-align: right; border: 1px solid #000000; padding: 4px; font-size: 9pt;">Total for ${escapeHtml(s.name)}:</td>
              <td style="text-align: center; border: 1px solid #000000; padding: 4px; font-size: 9pt;">${Number(s.total_hours).toFixed(2)} hrs</td>
              <td style="text-align: right; border: 1px solid #000000; padding: 4px; font-size: 9pt; font-weight: bold; color: #1e3a8a;">Remuneration: Rs. ${s.remuneration.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const amountWords = numberToRupeesInWords(grandTotalRemuneration);
  
  let logoBase64 = "";
  const logoImg = document.querySelector('.letter-header-logo');
  if (logoImg) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.naturalWidth || logoImg.width;
      canvas.height = logoImg.naturalHeight || logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(logoImg, 0, 0);
      logoBase64 = canvas.toDataURL('image/png');
    } catch(e) {
      console.warn("Could not base64 encode logo for summary Word doc:", e);
    }
  }

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>EWYL Monthly Logs Report - ${monthName}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          margin: 1in;
          color: #000000;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        .header-table td {
          border: none !important;
          padding: 0 !important;
        }
        .logo-img {
          width: 105px;
          height: auto;
        }
        .header-text {
          text-align: center;
          line-height: 1.3;
        }
        .header-text h2 {
          font-size: 11pt;
          margin: 0;
          font-weight: bold;
        }
        .header-text h1 {
          font-size: 16pt;
          margin: 2px 0 5px 0;
          font-weight: bold;
        }
        .header-divider {
          border-top: 1px solid #000000;
          border-bottom: 3.5px solid #000000;
          height: 3px;
          margin: 6px 0 25px 0;
        }
        .signatures-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 40px;
        }
        .signatures-table td {
          border: none !important;
          width: 50%;
          text-align: center;
          font-weight: bold;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 115px; vertical-align: top;">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Logo">` : '[Logo]'}
          </td>
          <td style="vertical-align: top;">
            <div class="header-text">
              <h2>INTERNAL QUALITY ASSURANCE CELL</h2>
              <h1>ST. JOSEPH'S COLLEGE (AUTONOMOUS)</h1>
              <table style="width: 100%; border-collapse: collapse; border: none !important; margin: 1px 0;">
                <tr>
                  <td style="border: none !important; padding: 0 !important; font-size: 8.5pt; text-align: left; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Accredited at A++ Grade (Cycle IV) by NAAC</td>
                  <td style="border: none !important; padding: 0 !important; font-size: 8.5pt; text-align: right; font-weight: bold; font-family: 'Times New Roman', Times, serif;">Special Heritage College Status awarded by UGC</td>
                </tr>
              </table>
              <table style="width: 100%; border-collapse: collapse; border: none !important; margin: 1px 0;">
                <tr>
                  <td style="border: none !important; padding: 0 !important; font-size: 8.5pt; text-align: left; font-weight: bold; font-family: 'Times New Roman', Times, serif;">College with Potential for Excellence by UGC</td>
                  <td style="border: none !important; padding: 0 !important; font-size: 8.5pt; text-align: right; font-weight: bold; font-family: 'Times New Roman', Times, serif;">DBT-STAR &amp; DST-FIST Sponsored College</td>
                </tr>
              </table>
              <p style="font-size: 10pt; font-weight: bold; margin: 3px 0 1px 0;">TIRUCHIRAPPALLI - 620 002</p>
              <p style="font-size: 8.5pt; margin: 1px 0;">Email: iqaccoor@mail.sjctni.edu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; website: www.sjctni.edu</p>
            </div>
          </td>
        </tr>
      </table>
      <div class="header-divider"></div>

      <div style="text-align: center; margin-bottom: 25px; font-weight: bold; font-size: 13pt; text-decoration: underline;">
        EARN WHILE YOU LEARN SCHEME - MONTHLY DAILY LOGS REPORT (${monthName.toUpperCase()})
      </div>

      ${studentsContentHtml || '<p style="text-align:center;">No students record found.</p>'}

      <div style="margin-top: 30px; border-top: 2px solid #000000; padding-top: 10px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="font-weight: bold; font-size: 11pt;">
            <td style="width: 70%; border: none !important;">GRAND TOTAL HOURS:</td>
            <td style="text-align: right; border: none !important;">${Number(grandTotalHours).toFixed(2)} hrs</td>
          </tr>
          <tr style="font-weight: bold; font-size: 11pt; color: #1e3a8a;">
            <td style="border: none !important;">GRAND TOTAL REMUNERATION:</td>
            <td style="text-align: right; border: none !important;">Rs. ${grandTotalRemuneration.toLocaleString()}</td>
          </tr>
        </table>
        <div style="font-weight: bold; margin-bottom: 25px;">
          Rupees in Words: <span style="text-decoration: underline;">Rupees ${amountWords} Only.</span>
        </div>
      </div>

      <table class="signatures-table">
        <tr>
          <td style="text-align: left; padding-left: 20px;">
            IQAC Coordinator<br><br><br><br>
            IQAC COORDINATOR
          </td>
          <td style="text-align: right; padding-right: 20px;">
            Rev. Fr. Principal<br><br><br><br>
            PRINCIPAL
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `ewyl_month_summary_${monthVal}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadMonthSummaryPDF(monthVal, summary, dailyLogs) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const marginX = 15;
    let currentY = 15;
    
    // 1. Logo
    const logoImg = document.querySelector('.letter-header-logo');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width;
        canvas.height = logoImg.naturalHeight || logoImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', marginX, currentY - 3, 25, 29);
      } catch(e) {
        console.warn("Could not embed logo in summary PDF:", e);
      }
    }
    
    // 2. Draw Header Text
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.text("INTERNAL QUALITY ASSURANCE CELL", 116, currentY + 3, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(15);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 116, currentY + 8, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Accredited at A++ Grade (Cycle IV) by NAAC", marginX + 26, currentY + 12);
    doc.text("Special Heritage College Status awarded by UGC", 210 - marginX, currentY + 12, { align: "right" });
    
    doc.text("College with Potential for Excellence by UGC", marginX + 26, currentY + 15);
    doc.text("DBT-STAR & DST-FIST Sponsored College", 210 - marginX, currentY + 15, { align: "right" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10.5);
    doc.text("TIRUCHIRAPPALLI - 620 002", 116, currentY + 19, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Email: iqaccoor@mail.sjctni.edu               website: www.sjctni.edu", 116, currentY + 22.5, { align: "center" });
    
    currentY += 25;
    
    // 3. Double Line Divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    doc.setLineWidth(1.1);
    doc.line(marginX, currentY + 0.9, 210 - marginX, currentY + 0.9);
    
    currentY += 12;
    
    // 4. Report Title
    const monthName = getMonthNameInWords(monthVal);
    doc.setFont("Times", "bold");
    doc.setFontSize(12);
    doc.text(`EARN WHILE YOU LEARN SCHEME - MONTHLY DAILY LOGS REPORT (${monthName.toUpperCase()})`, 105, currentY, { align: "center" });
    
    currentY += 10;
    
    const activeStudents = (summary || []).filter(s => s.total_hours > 0);
    let grandTotalHours = 0;
    let grandTotalRemuneration = 0;
    
    activeStudents.forEach((s, idx) => {
      grandTotalHours += s.total_hours;
      grandTotalRemuneration += s.remuneration;
      
      // Page break check
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFont("Times", "bold");
      doc.setFontSize(10);
      doc.text(`${idx + 1}. Student Name: ${s.name} (${s.reg_no})`, marginX, currentY);
      doc.text(`Dept: ${s.dept_name}`, 210 - marginX, currentY, { align: "right" });
      currentY += 4.5;
      
      doc.setFont("Times", "normal");
      doc.setFontSize(8.5);
      doc.text(`Bank Details: A/C: ${s.account_no} | Bank: ${s.bank_name} | IFSC: ${s.ifsc_code} | Branch: ${s.branch_name}`, marginX, currentY);
      currentY += 4;
      
      const studentLogs = (dailyLogs || []).filter(l => l.student_id === s.id);
      const tableRows = [];
      studentLogs.forEach((log, lIdx) => {
        let dateStr = log.date || '';
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        tableRows.push([
          String(lIdx + 1),
          dateStr,
          log.in_time,
          log.out_time,
          Number(log.total_hours).toFixed(2),
          log.work_done || '-'
        ]);
      });
      
      tableRows.push([
        { content: `Total for ${s.name}:`, colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `${Number(s.total_hours).toFixed(2)} hrs`, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: `Remuneration: Rs. ${s.remuneration.toLocaleString()}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 58, 138] } }
      ]);
      
      doc.autoTable({
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [['S.No', 'Date', 'IN Time', 'OUT Time', 'Hours', 'Work Done']],
        body: tableRows,
        theme: 'grid',
        styles: {
          font: 'Times',
          fontSize: 8.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.15
        },
        headStyles: {
          fillColor: [240, 240, 240],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', width: 12 },
          1: { halign: 'center', width: 22 },
          2: { halign: 'center', width: 18 },
          3: { halign: 'center', width: 18 },
          4: { halign: 'center', width: 22 }
        },
        didDrawPage: function(data) {
          currentY = data.cursor.y;
        }
      });
      
      currentY += 8;
    });
    
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    currentY += 5;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10.5);
    doc.text("GRAND TOTAL HOURS:", marginX, currentY);
    doc.text(`${Number(grandTotalHours).toFixed(2)} hrs`, 210 - marginX, currentY, { align: "right" });
    
    currentY += 5;
    doc.text("GRAND TOTAL REMUNERATION:", marginX, currentY);
    doc.text(`Rs. ${grandTotalRemuneration.toLocaleString()}`, 210 - marginX, currentY, { align: "right" });
    
    currentY += 2;
    doc.line(marginX, currentY, 210 - marginX, currentY);
    
    currentY += 8;
    
    const amountWords = numberToRupeesInWords(grandTotalRemuneration);
    doc.setFont("Times", "bold");
    doc.text(`Rupees in Words: Rupees ${amountWords} Only.`, marginX, currentY);
    
    currentY += 25;
    
    doc.text("IQAC Coordinator", marginX + 10, currentY);
    doc.text("Rev. Fr. Principal", 210 - marginX - 10, currentY, { align: "right" });
    
    doc.save(`ewyl_month_summary_${monthVal}.pdf`);
  } catch(err) {
    console.error("Month Summary PDF generation failed:", err);
    alert("Failed to generate PDF: " + err.message);
  }
}

// ================= COLLEGE EVENTS / PROGRAMS MODULE =================

async function loadCollegePrograms() {
  state.collegePrograms = await fetchAPI('/college-programs');
}

function renderCollegePrograms() {
  const tbody = document.getElementById('college-programs-table-body');
  if (!tbody) return;

  const programs = state.collegePrograms || [];

  // 1. Dynamic Dropdown Filters
  // Department filter (populated dynamically from entered data only)
  const deptFilter = document.getElementById('program-filter-dept');
  const currentDeptVal = deptFilter ? deptFilter.value : 'all';
  const uniqueDepts = [...new Set(programs.map(p => p.department).filter(Boolean))].sort();
  if (deptFilter) {
    deptFilter.innerHTML = '<option value="all">Select Department (All)</option>' +
      uniqueDepts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    // Restore selected filter value if still valid
    if (uniqueDepts.includes(currentDeptVal)) {
      deptFilter.value = currentDeptVal;
    } else {
      deptFilter.value = 'all';
    }
  }

  // Shift filter (populated dynamically from entered data only)
  const shiftFilter = document.getElementById('program-filter-shift');
  const currentShiftVal = shiftFilter ? shiftFilter.value : 'all';
  const uniqueShifts = [...new Set(programs.map(p => p.shift).filter(Boolean))].sort();
  if (shiftFilter) {
    shiftFilter.innerHTML = '<option value="all">Select Shift (All)</option>' +
      uniqueShifts.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    if (uniqueShifts.includes(currentShiftVal)) {
      shiftFilter.value = currentShiftVal;
    } else {
      shiftFilter.value = 'all';
    }
  }

  // Category filter (populated dynamically from entered data only)
  const catFilter = document.getElementById('program-filter-category');
  const currentCatVal = catFilter ? catFilter.value : 'all';
  const uniqueCats = [...new Set(programs.map(p => p.category).filter(Boolean))].sort();
  if (catFilter) {
    catFilter.innerHTML = '<option value="all">Select Category (All)</option>' +
      uniqueCats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (uniqueCats.includes(currentCatVal)) {
      catFilter.value = currentCatVal;
    } else {
      catFilter.value = 'all';
    }
  }

  // 2. Filter Application
  const selectedDept = deptFilter ? deptFilter.value : 'all';
  const selectedShift = shiftFilter ? shiftFilter.value : 'all';
  const selectedCat = catFilter ? catFilter.value : 'all';
  
  const dateFilterInput = document.getElementById('table-filter-date');
  const selectedDate = dateFilterInput ? dateFilterInput.value : '';
  
  const sortCol = state.programSortColumn || 'date';
  const sortOrder = state.programSortOrder || 'desc';

  let filtered = programs.filter(p => {
    if (selectedDept !== 'all' && p.department !== selectedDept) return false;
    if (selectedShift !== 'all' && p.shift !== selectedShift) return false;
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    
    if (selectedDate) {
      if (p.date === selectedDate) {
        // exact match
      } else if (p.date && p.date.includes(' to ')) {
        const parts = p.date.split(' to ');
        const fromDate = parts[0];
        const toDate = parts[1];
        if (fromDate && toDate) {
          if (selectedDate < fromDate || selectedDate > toDate) return false;
        } else if (fromDate && selectedDate !== fromDate) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  });

  // 3. Sort logic
  filtered.sort((a, b) => {
    if (sortCol === 'date') {
      const getFirstDateStr = (dateStr) => {
        if (!dateStr) return '';
        if (dateStr.includes(' to ')) return dateStr.split(' to ')[0];
        return dateStr;
      };
      const dateA = new Date(getFirstDateStr(a.date) || 0);
      const dateB = new Date(getFirstDateStr(b.date) || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortCol === 'dept') {
      const valA = (a.department || '').toLowerCase();
      const valB = (b.department || '').toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (sortCol === 'title') {
      const valA = (a.title || '').toLowerCase();
      const valB = (b.title || '').toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (sortCol === 'category') {
      const valA = (a.category || '').toLowerCase();
      const valB = (b.category || '').toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  // 4. Render Table Body
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 13.5px;">
          No college events registered matching selected filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    let displayDate = '';
    if (p.date) {
      if (p.date.includes(' to ')) {
        displayDate = p.date.split(' to ').map(d => {
          if (d.includes('-')) {
            const parts = d.split('-');
            return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
          }
          return d;
        }).join(' to ');
      } else {
        const d = p.date;
        if (d.includes('-')) {
          const parts = d.split('-');
          displayDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
        } else {
          displayDate = d;
        }
      }
    }

    // Invitation tick/cross icons
    const invitationIcon = p.invitation === 'Received' 
      ? `<span style="color: var(--success); font-weight: 700; font-size: 17px;" title="Received">&#10003;</span>` 
      : `<span style="color: var(--danger); font-weight: 700; font-size: 17px;" title="Not Received">&#10007;</span>`;

    // Evidence tick/cross icons
    const evidenceIcon = p.evidence === 'Received' 
      ? `<span style="color: var(--success); font-weight: 700; font-size: 17px;" title="Received">&#10003;</span>` 
      : `<span style="color: var(--danger); font-weight: 700; font-size: 17px;" title="Not Received">&#10007;</span>`;

    return `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 12px 16px; font-size: 13px;">${escapeHtml(displayDate)}</td>
        <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; font-size: 13px;">${escapeHtml(p.shift || '-')}</td>
        <td style="padding: 12px 16px; font-size: 13px; font-weight: 500;">${escapeHtml(p.title)}</td>
        <td style="padding: 12px 16px; font-size: 13px;">${escapeHtml(p.category)}</td>
        <td style="padding: 12px 16px; text-align: center;">${invitationIcon}</td>
        <td style="padding: 12px 16px; text-align: center;">${evidenceIcon}</td>
        <td style="padding: 12px 16px; text-align: center; white-space: nowrap;">
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-xs btn-icon" onclick="openEditProgramModal(${p.id})" style="padding: 6px; border-radius: 6px;" title="Edit Event">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn btn-danger btn-xs btn-icon" onclick="deleteCollegeProgram(${p.id})" style="padding: 6px; border-radius: 6px;" title="Delete Event">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function applyHeaderSort(col, order) {
  if (!order) {
    state.programSortColumn = 'date';
    state.programSortOrder = 'desc';
  } else {
    state.programSortColumn = col;
    state.programSortOrder = order;
  }
  renderCollegePrograms();
}

function openAddProgramModal() {
  document.getElementById('college-program-form').reset();
  document.getElementById('program-edit-id').value = '';
  document.getElementById('program-modal-title').innerText = 'Add College Event';
  document.getElementById('program-submit-btn').innerText = 'Register Event';
  
  updateCategorySelectOptions();
  toggleCategoryOtherInput('');
  
  // Clear dates explicitly
  document.getElementById('program-date-from').value = '';
  document.getElementById('program-date-to').value = '';
  
  // Set defaults explicitly
  document.getElementById('program-invitation').value = 'Received';
  document.getElementById('program-evidence').value = 'Not Received';
  
  document.getElementById('college-program-modal').classList.add('open');
}

function closeCollegeProgramModal() {
  document.getElementById('college-program-modal').classList.remove('open');
}

function toggleCategoryOtherInput(val) {
  const otherInput = document.getElementById('program-category-other');
  if (otherInput) {
    if (val === 'others') {
      otherInput.style.display = 'block';
      otherInput.required = true;
    } else {
      otherInput.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  }
}

function updateCategorySelectOptions() {
  const select = document.getElementById('program-category-select');
  if (!select) return;
  const defaultValue = select.value;
  
  const defaultOptions = [
    "Endowment Lecture", "Conference", "Webinar", "Seminar", "Orientation",
    "Skill Development", "VAC", "CC", "Induction", "FDP", "Workshop",
    "Club Activity", "IKS", "Gender Based"
  ];
  
  const programs = state.collegePrograms || [];
  const uniqueCats = [...new Set(programs.map(p => p.category).filter(Boolean))];
  const customCats = uniqueCats.filter(c => !defaultOptions.includes(c));
  
  let optionsHtml = '<option value="">Select Category</option>';
  defaultOptions.forEach(opt => {
    optionsHtml += `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`;
  });
  
  customCats.forEach(opt => {
    optionsHtml += `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`;
  });
  
  optionsHtml += '<option value="others">others</option>';
  select.innerHTML = optionsHtml;
  select.value = defaultValue;
}

function openEditProgramModal(id) {
  const p = (state.collegePrograms || []).find(prog => prog.id == id);
  if (!p) return;

  document.getElementById('program-edit-id').value = p.id;
  document.getElementById('program-title').value = p.title || '';
  document.getElementById('program-dept').value = p.department || '';
  document.getElementById('program-shift').value = p.shift || '';
  
  // Handle date ranges
  if (p.date && p.date.includes(' to ')) {
    const parts = p.date.split(' to ');
    document.getElementById('program-date-from').value = parts[0] || '';
    document.getElementById('program-date-to').value = parts[1] || '';
  } else {
    document.getElementById('program-date-from').value = p.date || '';
    document.getElementById('program-date-to').value = '';
  }
  
  document.getElementById('program-invitation').value = p.invitation || 'Received';
  document.getElementById('program-evidence').value = p.evidence || 'Received';

  updateCategorySelectOptions();

  const categorySelect = document.getElementById('program-category-select');
  const categoryOther = document.getElementById('program-category-other');
  const catVal = p.category || '';
  
  const defaultOptions = [
    "Endowment Lecture", "Conference", "Webinar", "Seminar", "Orientation",
    "Skill Development", "VAC", "CC", "Induction", "FDP", "Workshop",
    "Club Activity", "IKS", "Gender Based"
  ];

  if (defaultOptions.includes(catVal)) {
    categorySelect.value = catVal;
    toggleCategoryOtherInput(catVal);
  } else {
    categorySelect.value = catVal;
    toggleCategoryOtherInput(catVal);
    if (categorySelect.value !== catVal) {
      categorySelect.value = 'others';
      toggleCategoryOtherInput('others');
      categoryOther.value = catVal;
    }
  }

  document.getElementById('program-modal-title').innerText = 'Edit College Event';
  document.getElementById('program-submit-btn').innerText = 'Update Event';
  document.getElementById('college-program-modal').classList.add('open');
}

async function saveCollegeProgram(e) {
  e.preventDefault();
  const id = document.getElementById('program-edit-id').value;
  const title = document.getElementById('program-title').value.trim();
  const department = document.getElementById('program-dept').value.trim();
  const shift = document.getElementById('program-shift').value.trim();
  
  const fromDate = document.getElementById('program-date-from').value;
  const toDate = document.getElementById('program-date-to').value;
  const date = toDate ? `${fromDate} to ${toDate}` : fromDate;
  
  const invitation = document.getElementById('program-invitation').value;
  const evidence = document.getElementById('program-evidence').value;

  const categorySelect = document.getElementById('program-category-select').value;
  const categoryOther = document.getElementById('program-category-other').value.trim();
  const category = categorySelect === 'others' ? categoryOther : categorySelect;

  if (!category) {
    showToast("Please enter or select a category.", "error");
    return;
  }

  const payload = { title, department, shift, category, date, invitation, evidence };

  try {
    if (id) {
      await fetchAPI(`/college-programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast("College event updated successfully.", "success");
    } else {
      await fetchAPI('/college-programs', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast("College event registered successfully.", "success");
    }
    
    closeCollegeProgramModal();
    await loadCollegePrograms();
    renderCollegePrograms();
  } catch (err) {
    console.error("Failed to save college program:", err);
  }
}

async function deleteCollegeProgram(id) {
  const confirmed = await showCustomConfirm(
    "Delete Event?",
    "Are you sure you want to delete this college event? This action cannot be undone."
  );
  if (!confirmed) return;

  try {
    await fetchAPI(`/college-programs/${id}`, {
      method: 'DELETE'
    });
    showToast("College event deleted successfully.", "success");
    await loadCollegePrograms();
    renderCollegePrograms();
  } catch (err) {
    console.error("Failed to delete college program:", err);
  }
}

function exportCollegeEventsExcel() {
  try {
    const programs = state.collegePrograms || [];
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };

    let csvRows = [];
    csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
    csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
    csvRows.push([escapeCsv("College Events / Programs Report")]);
    csvRows.push([]);
    csvRows.push([
      escapeCsv('Date'),
      escapeCsv('Department'),
      escapeCsv('Shift'),
      escapeCsv('Program Title'),
      escapeCsv('Category'),
      escapeCsv('Invitation Status'),
      escapeCsv('Evidence Status')
    ]);

    programs.forEach(p => {
      let displayDate = p.date || '';
      if (displayDate.includes('-')) {
        const parts = displayDate.split('-');
        if (parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      csvRows.push([
        escapeCsv(displayDate),
        escapeCsv(p.department),
        escapeCsv(p.shift || '-'),
        escapeCsv(p.title),
        escapeCsv(p.category),
        escapeCsv(p.invitation),
        escapeCsv(p.evidence)
      ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    downloadCSV(csvContent, 'college_events_report.csv');
  } catch (err) {
    console.error("Failed to export College Events Excel:", err);
    alert("Failed to export Excel: " + err.message);
  }
}

async function exportCollegeEventsPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const marginX = 15;
    let currentY = 15;
    
    // Draw Crest Logo
    const logoImg = document.querySelector('.letter-header-logo');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width;
        canvas.height = logoImg.naturalHeight || logoImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', marginX, currentY - 3, 25, 29);
      } catch(e) {
        console.warn("Could not embed logo in PDF:", e);
      }
    }
    
    // Draw Header Text
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("INTERNAL QUALITY ASSURANCE CELL", 116, currentY + 3, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(15);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 116, currentY + 8, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Accredited at A++ Grade (Cycle IV) by NAAC", marginX + 26, currentY + 12);
    doc.text("Special Heritage College Status awarded by UGC", 210 - marginX, currentY + 12, { align: "right" });
    
    doc.text("College with Potential for Excellence by UGC", marginX + 26, currentY + 15);
    doc.text("DBT-STAR & DST-FIST Sponsored College", 210 - marginX, currentY + 15, { align: "right" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10.5);
    doc.text("TIRUCHIRAPPALLI - 620 002", 116, currentY + 19, { align: "center" });
    
    doc.setFont("Times", "bold");
    doc.setFontSize(8.5);
    doc.text("Email: iqaccoor@mail.sjctni.edu               website: www.sjctni.edu", 116, currentY + 22.5, { align: "center" });
    
    currentY += 25;
    
    // Double Line Divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    doc.setLineWidth(1.1);
    doc.line(marginX, currentY + 0.9, 210 - marginX, currentY + 0.9);
    
    currentY += 12;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(12);
    doc.text("COLLEGE EVENTS / PROGRAMS REPORT", 105, currentY, { align: "center" });
    
    const headers = [['Date', 'Department', 'Shift', 'Program Title', 'Category', 'Invitation', 'Evidence']];
    const rows = [];
    const programs = state.collegePrograms || [];

    programs.forEach(p => {
      let displayDate = p.date || '';
      if (displayDate.includes('-')) {
        const parts = displayDate.split('-');
        if (parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      rows.push([
        displayDate,
        p.department,
        p.shift || '-',
        p.title,
        p.category,
        p.invitation,
        p.evidence
      ]);
    });

    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: headers,
      body: rows,
      theme: 'grid',
      styles: {
        font: 'Times',
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [240, 240, 240],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', width: 22 },
        2: { halign: 'center', width: 18 },
        5: { halign: 'center', width: 22 },
        6: { halign: 'center', width: 22 }
      }
    });

    doc.save('college_events_report.pdf');
  } catch (err) {
    console.error("Failed to generate College Events PDF:", err);
    alert("Failed to generate PDF: " + err.message);
  }
}

async function exportPesPDFSummary(list, filename) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    const marginX = 15;
    let currentY = 15;
    
    const logoImg = document.querySelector('.letter-header-logo');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width;
        canvas.height = logoImg.naturalHeight || logoImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', marginX, currentY, 15, 25);
      } catch(e) {}
    }
    
    doc.setFont("Times", "bold");
    doc.setFontSize(14);
    doc.text("St. Joseph's College (Autonomous)", 148, currentY + 5, { align: "center" });
    doc.setFontSize(12);
    doc.text("Internal Quality Assurance Cell (IQAC)", 148, currentY + 11, { align: "center" });
    doc.setFontSize(13);
    doc.text("Performance & Excellence Scorecard (PES) Report", 148, currentY + 17, { align: "center" });
    
    currentY += 28;
    
    const headers = [[
      'S.No', 'Department', 'Academic Year',
      'Publications (Prev/Targ)', 'Books (Prev/Targ)', 'Projects (Prev/Targ)', 'MoUs (Prev/Targ)', 'HOD Name'
    ]];
    
    let totals = { pubP: 0, pubT: 0, bkP: 0, bkT: 0, prP: 0, prT: 0, moP: 0, moT: 0 };
    const rows = [];
    
    list.forEach((p, idx) => {
      const data = p.data || {};
      const pubP = data.parameters && data.parameters.param_1 ? data.parameters.param_1.prev : 0;
      const pubT = data.parameters && data.parameters.param_1 ? data.parameters.param_1.target : 0;
      const bkP = data.parameters && data.parameters.param_2 ? data.parameters.param_2.prev : 0;
      const bkT = data.parameters && data.parameters.param_2 ? data.parameters.param_2.target : 0;
      const prP = data.parameters && data.parameters.param_6a ? (data.parameters.param_6a.prev + (data.parameters.param_6b ? data.parameters.param_6b.prev : 0)) : 0;
      const prT = data.parameters && data.parameters.param_6a ? (data.parameters.param_6a.target + (data.parameters.param_6b ? data.parameters.param_6b.target : 0)) : 0;
      const moP = data.collaboration && data.collaboration.param_1 ? data.collaboration.param_1.prev : 0;
      const moT = data.collaboration && data.collaboration.param_1 ? data.collaboration.param_1.target : 0;
      
      totals.pubP += pubP; totals.pubT += pubT;
      totals.bkP += bkP; totals.bkT += bkT;
      totals.prP += prP; totals.prT += prT;
      totals.moP += moP; totals.moT += moT;
      
      rows.push([
        idx + 1,
        p.department,
        p.academic_year,
        `${pubP} / ${pubT}`,
        `${bkP} / ${bkT}`,
        `${prP} / ${prT}`,
        `${moP} / ${moT}`,
        data.hod_name || '-'
      ]);
    });
    
    rows.push([
      'Total', 'Total of Filtered Data', '',
      `${totals.pubP} / ${totals.pubT}`,
      `${totals.bkP} / ${totals.bkT}`,
      `${totals.prP} / ${totals.prT}`,
      `${totals.moP} / ${totals.moT}`,
      ''
    ]);
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: headers,
      body: rows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 15 },
        2: { halign: 'center', width: 30 },
        3: { halign: 'center', width: 42 },
        4: { halign: 'center', width: 38 },
        5: { halign: 'center', width: 38 },
        6: { halign: 'center', width: 38 }
      },
      didParseCell: function (data) {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [243, 244, 246];
        }
      }
    });
    
    doc.save(filename);
  } catch (err) {
    console.error("Failed to generate PDF summary:", err);
    alert(err.message || "Failed to generate PDF summary");
  }
}

async function exportSinglePesPDF() {
  const pes = state.pesSubmissions.find(p => p.id == state.activeViewPesId);
  if (!pes) return;
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const marginX = 15;
    let currentY = 15;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(12);
    doc.text("Internal Quality Assurance Cell (IQAC)", 105, currentY, { align: "center" });
    doc.setFontSize(14);
    doc.text("St. Joseph's College (Autonomous)", 105, currentY + 6, { align: "center" });
    doc.setFontSize(11);
    doc.text("Tiruchirappalli - 620 002", 105, currentY + 11, { align: "center" });
    doc.setFontSize(13);
    doc.text("Department Performance and Excellence Scorecard", 105, currentY + 17, { align: "center" });
    doc.text(`Academic Year: ${pes.academic_year}`, 105, currentY + 23, { align: "center" });
    doc.text(pes.department.toUpperCase(), 105, currentY + 29, { align: "center" });
    
    currentY += 35;
    doc.line(marginX, currentY, 210 - marginX, currentY);
    currentY += 8;
    
    const data = pes.data || {};
    
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text("1. RESEARCH, TEACHING EXCELLENCE, AND INNOVATION", marginX, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 6;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text("Major Research Areas of the Department:", marginX, currentY);
    currentY += 5;
    doc.setFont("Times", "normal");
    const areas = data.major_research_areas || [];
    areas.forEach((area, index) => {
      doc.text(`${String.fromCharCode(97 + index)}. ${area}`, marginX + 5, currentY);
      currentY += 5;
    });
    currentY += 4;
    
    const paramsHeaders = [['S. No.', 'Research Parameter', 'Previous Year (2025-26)', 'Target for 2026-27']];
    const paramsRows = [];
    const params = data.parameters || {};
    const paramNames = [
      "Research Publications",
      "Books Published",
      "Book Chapters Published",
      "Conference Proceedings",
      "Average Departmental H-index",
      "Research Projects: (a) Submitted",
      "Research Projects: (b) Sanctioned",
      "Patent Applications Submitted",
      "Patents Granted",
      "Copyrights Filed",
      "Product Development Projects",
      "Prototypes Developed",
      "Start-ups Incubated",
      "Technology Transfer Initiatives"
    ];
    
    paramNames.forEach((name, idx) => {
      const sNo = idx + 1;
      let prev = 0, target = 0;
      if (sNo === 6) {
        prev = params.param_6a ? params.param_6a.prev : 0;
        target = params.param_6a ? params.param_6a.target : 0;
      } else if (sNo === 7) {
        prev = params.param_6b ? params.param_6b.prev : 0;
        target = params.param_6b ? params.param_6b.target : 0;
      } else {
        const key = `param_${sNo > 7 ? sNo - 1 : sNo}`;
        prev = params[key] ? params[key].prev : 0;
        target = params[key] ? params[key].target : 0;
      }
      paramsRows.push([
        sNo === 7 ? '' : (sNo > 7 ? sNo - 1 : sNo),
        name,
        prev,
        target
      ]);
    });
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: paramsHeaders,
      body: paramsRows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 15 },
        2: { halign: 'center', width: 45 },
        3: { halign: 'center', width: 45 }
      }
    });
    
    doc.addPage();
    currentY = 15;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text("2. TEACHING-LEARNING PEDAGOGY (TLP)", marginX, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 8;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text("Faculty-wise Compliance Plan:", marginX, currentY);
    currentY += 5;
    
    const facHeaders = [[
      'S. No', 'Faculty Name', 'TLPs Odd Sem', 'TLPs Even Sem', 'Assessments Odd Sem', 'Assessments Even Sem', 'E-Content'
    ]];
    const facRows = [];
    (data.faculty_compliance || []).forEach((f, idx) => {
      facRows.push([
        idx + 1,
        f.name,
        f.tlp_odd,
        f.tlp_even,
        f.assess_odd,
        f.assess_even,
        f.econtent
      ]);
    });
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: facHeaders,
      body: facRows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 15 },
        2: { halign: 'center', width: 28 },
        3: { halign: 'center', width: 28 },
        4: { halign: 'center', width: 32 },
        5: { halign: 'center', width: 32 },
        6: { halign: 'center', width: 25 }
      }
    });
    
    currentY = doc.previousAutoTable.finalY + 8;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text("Department Teaching Innovation Targets:", marginX, currentY);
    currentY += 5;
    
    const targetHeaders = [['S. No', 'Practice', 'Planned', 'S. No', 'Practice', 'Planned']];
    const targetRows = [];
    const targets = data.innovation_targets || {};
    const tNames = [
      "Flipped Classroom Sessions",
      "Project-Based Learning Activities",
      "Problem-Based Learning Activities",
      "Experiential Learning Activities",
      "ICT-Enabled Teaching Sessions",
      "AI-Assisted Learning Activities",
      "Peer Learning Activities",
      "Case Study-Based Teaching",
      "Field-Based Learning Activities",
      targets.target_10_spec ? `Any other: ${targets.target_10_spec}` : "Any other"
    ];
    for (let i = 0; i < 5; i++) {
      targetRows.push([
        i + 1,
        tNames[i],
        targets[`target_${i + 1}`] || 0,
        i + 6,
        tNames[i + 5],
        targets[`target_${i + 6}`] || 0
      ]);
    }
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: targetHeaders,
      body: targetRows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 12 },
        2: { halign: 'center', width: 75 },
        3: { halign: 'center', width: 18 },
        4: { halign: 'center', width: 12 },
        5: { halign: 'center', width: 75 }
      }
    });
    
    doc.addPage();
    currentY = 15;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text("3. PLACEMENT AND CAREER DEVELOPMENT", marginX, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 6;
    
    const placeHeaders = [['S. No.', 'Placement Parameter', 'Previous Year (2025-26)', 'Target for 2026-27']];
    const placeRows = [];
    const place = data.placement || {};
    const pNames = [
      "MoUs created for Placements / Projects / Internships",
      "Placement Training Programmes",
      "Industry Interaction / Training Sessions"
    ];
    pNames.forEach((name, idx) => {
      const key = `param_${idx + 1}`;
      placeRows.push([
        idx + 1,
        name,
        place[key] ? place[key].prev : 0,
        place[key] ? place[key].target : 0
      ]);
    });
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: placeHeaders,
      body: placeRows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 15 },
        2: { halign: 'center', width: 45 },
        3: { halign: 'center', width: 45 }
      }
    });
    
    currentY = doc.previousAutoTable.finalY + 6;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text("Plans to Improve Placement Opportunities:", marginX, currentY);
    currentY += 5;
    doc.setFont("Times", "normal");
    (data.placement_plans || []).forEach((p, idx) => {
      doc.text(`${String.fromCharCode(97 + idx)}. ${p}`, marginX + 5, currentY);
      currentY += 5;
    });
    
    currentY += 4;
    doc.setFont("Times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text("4. INDUSTRY-ACADEMIA COLLABORATION", marginX, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 6;
    
    const collabHeaders = [['S. No.', 'Parameter', 'Previous Year (2025-26)', 'Target for 2026-27']];
    const collabRows = [];
    const collab = data.collaboration || {};
    const cNames = [
      "MoUs Signed",
      "Active MoUs",
      "Industry Experts Invited",
      "Industrial Visits Conducted",
      "Industry - Sponsored Research Projects",
      "Consultancy Assignments",
      "Joint Publications with Industry"
    ];
    cNames.forEach((name, idx) => {
      const key = `param_${idx + 1}`;
      collabRows.push([
        idx + 1,
        name,
        collab[key] ? collab[key].prev : 0,
        collab[key] ? collab[key].target : 0
      ]);
    });
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: collabHeaders,
      body: collabRows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', width: 15 },
        2: { halign: 'center', width: 45 },
        3: { halign: 'center', width: 45 }
      }
    });
    
    currentY = doc.previousAutoTable.finalY + 6;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text("Plans for Industry-Academia Collaboration:", marginX, currentY);
    currentY += 5;
    doc.setFont("Times", "normal");
    (data.collaboration_plans || []).forEach((c, idx) => {
      doc.text(`${String.fromCharCode(97 + idx)}. ${c}`, marginX + 5, currentY);
      currentY += 5;
    });
    
    currentY += 20;
    
    doc.setFont("Times", "bold");
    doc.setFontSize(10);
    doc.text(data.hod_name || '', 210 - marginX - 50, currentY, { align: "center" });
    doc.line(210 - marginX - 75, currentY + 1, 210 - marginX - 25, currentY + 1);
    doc.text("Head of the Department / Coordinator", 210 - marginX - 50, currentY + 6, { align: "center" });
    
    doc.save(`pes_scorecard_${pes.department.replace(/\s+/g, '_')}_${pes.academic_year}.pdf`);
  } catch (err) {
    console.error("Failed to generate detailed PDF:", err);
    alert(err.message || "Failed to generate detailed PDF");
  }
}

// =========================================================================
// ================= PERFORMANCE & EXCELLENCE SCORECARD (PES) =================
// =========================================================================

// =========================================================================
// ================= PERFORMANCE & EXCELLENCE SCORECARD (PES) =================
// =========================================================================

async function loadPesSubmissions() {
  try {
    const res = await fetchAPI('/pes');
    state.pesSubmissions = res || [];
  } catch (err) {
    console.error("Failed to load PES Submissions:", err);
    state.pesSubmissions = [];
  }
}

function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  if (!submenu) return;
  const isHidden = submenu.style.display === 'none';
  submenu.style.display = isHidden ? 'block' : 'none';
  
  // Rotate chevron icon
  const toggleEl = submenu.previousElementSibling;
  const chevron = toggleEl.querySelector('.chevron-icon');
  if (chevron) {
    chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

// ---------------- STAFF FULL-SCREEN SCORECARD CONTROLLERS ----------------
function hideStaffPesForm() {
  document.getElementById('staff-pes-table-container').style.display = 'block';
  document.getElementById('staff-pes-form-container').style.display = 'none';
}

let facultyRowCounter = 0;
function addPesFacultyRow(data = {}) {
  const tbody = document.getElementById('pes-faculty-tbody');
  if (!tbody) return;
  facultyRowCounter++;
  const tr = document.createElement('tr');
  tr.id = `pes-faculty-row-${facultyRowCounter}`;
  tr.innerHTML = `
    <td style="padding: 10px; text-align: center;" class="row-sno"></td>
    <td style="padding: 8px;">
      <input type="text" class="form-control pes-f-name" value="${escapeHtml(data.name || '')}" placeholder="Dr. / Prof. Name" required style="height: 32px; padding: 4px 8px;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control pes-f-tlp-odd" value="${data.tlp_odd !== undefined ? data.tlp_odd : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control pes-f-tlp-even" value="${data.tlp_even !== undefined ? data.tlp_even : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control pes-f-assess-odd" value="${data.assess_odd !== undefined ? data.assess_odd : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control pes-f-assess-even" value="${data.assess_even !== undefined ? data.assess_even : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control pes-f-econtent" value="${data.econtent !== undefined ? data.econtent : 1}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px; text-align: center;">
      <button type="button" class="btn btn-danger btn-xs" onclick="deletePesFacultyRow(this)" style="padding: 4px 8px; border-radius: 4px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
  updatePesFacultySNo();
}

function deletePesFacultyRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    updatePesFacultySNo();
  }
}

function updatePesFacultySNo() {
  const tbody = document.getElementById('pes-faculty-tbody');
  if (!tbody) return;
  Array.from(tbody.children).forEach((tr, index) => {
    const snoCell = tr.querySelector('.row-sno');
    if (snoCell) snoCell.innerText = index + 1;
  });
}

function addPesResearchAreaRow(val = "") {
  const container = document.getElementById('pes-research-areas-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control pes-res-area" placeholder="Enter a major research area of the department" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;" required>
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function addPesOtherInnovationRow(specName = "", val = 0) {
  const container = document.getElementById('pes-other-targets-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '12px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control pes-other-target-spec" placeholder="Practice description" value="${escapeHtml(specName)}" style="height: 36px; padding-left: 10px; flex: 2;" required>
    <input type="number" min="0" class="form-control pes-other-target-val" placeholder="No. Planned" value="${val}" style="height: 36px; padding-left: 10px; flex: 1; text-align: center;" required>
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function addPesPlacementPlanRow(val = "") {
  const container = document.getElementById('pes-placement-plans-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control pes-place-plan" placeholder="e.g. Conduct Mock Placement interviews" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;">
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function addPesCollabPlanRow(val = "") {
  const container = document.getElementById('pes-collab-plans-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control pes-collab-plan" placeholder="e.g. Sign MoUs with local biotech companies" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;">
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function openAddPesModal() {
  document.getElementById('pes-scorecard-form').reset();
  document.getElementById('pes-edit-id').value = '';
  document.getElementById('pes-academic-year').value = '2026-2027';
  document.getElementById('pes-department').value = '';
  
  // Clear dynamic lists
  document.getElementById('pes-research-areas-list').innerHTML = '';
  document.getElementById('pes-faculty-tbody').innerHTML = '';
  document.getElementById('pes-other-targets-list').innerHTML = '';
  document.getElementById('pes-placement-plans-list').innerHTML = '';
  document.getElementById('pes-collab-plans-list').innerHTML = '';
  
  // Add initial rows
  addPesResearchAreaRow();
  addPesFacultyRow();
  addPesFacultyRow();
  addPesFacultyRow();
  
  // Switch visibility
  document.getElementById('staff-pes-table-container').style.display = 'none';
  document.getElementById('staff-pes-form-container').style.display = 'block';
  document.getElementById('staff-pes-form-title').innerText = "Create Department Scorecard";
}

function openEditPesModal(id) {
  const pes = state.pesSubmissions.find(p => p.id == id);
  if (!pes) return;
  
  document.getElementById('pes-scorecard-form').reset();
  document.getElementById('pes-edit-id').value = pes.id;
  document.getElementById('pes-academic-year').value = pes.academic_year || '2026-2027';
  document.getElementById('pes-department').value = pes.department || '';
  
  const data = pes.data || {};
  
  // 1. Research Areas
  const researchList = document.getElementById('pes-research-areas-list');
  researchList.innerHTML = '';
  const areas = data.major_research_areas || [];
  if (areas.length > 0) {
    areas.forEach(area => addPesResearchAreaRow(area));
  } else {
    addPesResearchAreaRow();
  }
  
  // 2. Parameters (13 Research parameters)
  const params = data.parameters || {};
  for (let k in params) {
    const num = k.replace('param_', '');
    const elPrev = document.getElementById(`pes-param-${num}-prev`);
    const elTarget = document.getElementById(`pes-param-${num}-target`);
    if (elPrev) elPrev.value = params[k].prev || 0;
    if (elTarget) elTarget.value = params[k].target || 0;
  }
  
  // 3. Faculty Compliance Rows
  const facultyTbody = document.getElementById('pes-faculty-tbody');
  facultyTbody.innerHTML = '';
  const facultyList = data.faculty_compliance || [];
  if (facultyList.length > 0) {
    facultyList.forEach(fac => addPesFacultyRow(fac));
  } else {
    addPesFacultyRow(); addPesFacultyRow(); addPesFacultyRow();
  }
  
  // 4. Teaching Innovation Targets (1-9)
  const targets = data.innovation_targets || {};
  for (let i = 1; i <= 9; i++) {
    const el = document.getElementById(`pes-target-${i}`);
    if (el) el.value = targets[`target_${i}`] || 0;
  }
  
  // 5. Dynamic specify other innovation targets
  const otherList = document.getElementById('pes-other-targets-list');
  otherList.innerHTML = '';
  const otherTargets = targets.other_targets || [];
  if (otherTargets.length > 0) {
    otherTargets.forEach(t => addPesOtherInnovationRow(t.spec, t.count));
  } else if (targets.target_10_spec && targets.target_10) {
    addPesOtherInnovationRow(targets.target_10_spec, targets.target_10);
  }
  
  // 6. Placement Parameter Table (1-3)
  const placeParams = data.placement || {};
  for (let i = 1; i <= 3; i++) {
    const elPrev = document.getElementById(`pes-place-${i}-prev`);
    const elTarget = document.getElementById(`pes-place-${i}-target`);
    if (elPrev) elPrev.value = placeParams[`param_${i}`] ? placeParams[`param_${i}`].prev : 0;
    if (elTarget) elTarget.value = placeParams[`param_${i}`] ? placeParams[`param_${i}`].target : 0;
  }
  
  // 7. Placement plans (Dynamic list)
  const placementPlansList = document.getElementById('pes-placement-plans-list');
  placementPlansList.innerHTML = '';
  const placePlans = data.placement_plans || [];
  if (placePlans.length > 0) {
    placePlans.forEach(plan => addPesPlacementPlanRow(plan));
  } else {
    addPesPlacementPlanRow();
  }
  
  // 8. Collaboration Parameters (1-7)
  const collabParams = data.collaboration || {};
  for (let i = 1; i <= 7; i++) {
    const elPrev = document.getElementById(`pes-collab-${i}-prev`);
    const elTarget = document.getElementById(`pes-collab-${i}-target`);
    if (elPrev) elPrev.value = collabParams[`param_${i}`] ? collabParams[`param_${i}`].prev : 0;
    if (elTarget) elTarget.value = collabParams[`param_${i}`] ? collabParams[`param_${i}`].target : 0;
  }
  
  // 9. Collaboration plans (Dynamic list)
  const collabPlansList = document.getElementById('pes-collab-plans-list');
  collabPlansList.innerHTML = '';
  const collabPlans = data.collaboration_plans || [];
  if (collabPlans.length > 0) {
    collabPlans.forEach(plan => addPesCollabPlanRow(plan));
  } else {
    addPesCollabPlanRow();
  }
  
  document.getElementById('staff-pes-table-container').style.display = 'none';
  document.getElementById('staff-pes-form-container').style.display = 'block';
  document.getElementById('staff-pes-form-title').innerText = "Edit Department Scorecard";
}

async function savePesScorecard(e) {
  e.preventDefault();
  const academic_year = document.getElementById('pes-academic-year').value;
  const department = document.getElementById('pes-department').value.trim();
  const id = document.getElementById('pes-edit-id').value;
  
  if (!department) {
    alert("Department Name is required!");
    return;
  }
  
  const major_research_areas = [];
  document.querySelectorAll('.pes-res-area').forEach(input => {
    const val = input.value.trim();
    if (val) major_research_areas.push(val);
  });
  
  const parameters = {
    param_1: { prev: Number(document.getElementById('pes-param-1-prev').value) || 0, target: Number(document.getElementById('pes-param-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('pes-param-2-prev').value) || 0, target: Number(document.getElementById('pes-param-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('pes-param-3-prev').value) || 0, target: Number(document.getElementById('pes-param-3-target').value) || 0 },
    param_4: { prev: Number(document.getElementById('pes-param-4-prev').value) || 0, target: Number(document.getElementById('pes-param-4-target').value) || 0 },
    param_5: { prev: Number(document.getElementById('pes-param-5-prev').value) || 0, target: Number(document.getElementById('pes-param-5-target').value) || 0 },
    param_6a: { prev: Number(document.getElementById('pes-param-6a-prev').value) || 0, target: Number(document.getElementById('pes-param-6a-target').value) || 0 },
    param_6b: { prev: Number(document.getElementById('pes-param-6b-prev').value) || 0, target: Number(document.getElementById('pes-param-6b-target').value) || 0 },
    param_7: { prev: Number(document.getElementById('pes-param-7-prev').value) || 0, target: Number(document.getElementById('pes-param-7-target').value) || 0 },
    param_8: { prev: Number(document.getElementById('pes-param-8-prev').value) || 0, target: Number(document.getElementById('pes-param-8-target').value) || 0 },
    param_9: { prev: Number(document.getElementById('pes-param-9-prev').value) || 0, target: Number(document.getElementById('pes-param-9-target').value) || 0 },
    param_10: { prev: Number(document.getElementById('pes-param-10-prev').value) || 0, target: Number(document.getElementById('pes-param-10-target').value) || 0 },
    param_11: { prev: Number(document.getElementById('pes-param-11-prev').value) || 0, target: Number(document.getElementById('pes-param-11-target').value) || 0 },
    param_12: { prev: Number(document.getElementById('pes-param-12-prev').value) || 0, target: Number(document.getElementById('pes-param-12-target').value) || 0 },
    param_13: { prev: Number(document.getElementById('pes-param-13-prev').value) || 0, target: Number(document.getElementById('pes-param-13-target').value) || 0 }
  };
  
  const faculty_compliance = [];
  document.querySelectorAll('#pes-faculty-tbody tr').forEach(tr => {
    const name = tr.querySelector('.pes-f-name').value.trim();
    const tlp_odd = Number(tr.querySelector('.pes-f-tlp-odd').value) || 0;
    const tlp_even = Number(tr.querySelector('.pes-f-tlp-even').value) || 0;
    const assess_odd = Number(tr.querySelector('.pes-f-assess-odd').value) || 0;
    const assess_even = Number(tr.querySelector('.pes-f-assess-even').value) || 0;
    const econtent = Number(tr.querySelector('.pes-f-econtent').value) || 0;
    if (name) {
      faculty_compliance.push({ name, tlp_odd, tlp_even, assess_odd, assess_even, econtent });
    }
  });
  
  const other_targets = [];
  document.querySelectorAll('#pes-other-targets-list > div').forEach(div => {
    const spec = div.querySelector('.pes-other-target-spec').value.trim();
    const count = Number(div.querySelector('.pes-other-target-val').value) || 0;
    if (spec) {
      other_targets.push({ spec, count });
    }
  });
  
  const innovation_targets = {
    target_1: Number(document.getElementById('pes-target-1').value) || 0,
    target_2: Number(document.getElementById('pes-target-2').value) || 0,
    target_3: Number(document.getElementById('pes-target-3').value) || 0,
    target_4: Number(document.getElementById('pes-target-4').value) || 0,
    target_5: Number(document.getElementById('pes-target-5').value) || 0,
    target_6: Number(document.getElementById('pes-target-6').value) || 0,
    target_7: Number(document.getElementById('pes-target-7').value) || 0,
    target_8: Number(document.getElementById('pes-target-8').value) || 0,
    target_9: Number(document.getElementById('pes-target-9').value) || 0,
    
    // Store first specify in target_10 for backward compatibility
    target_10_spec: other_targets[0] ? other_targets[0].spec : '',
    target_10: other_targets[0] ? other_targets[0].count : 0,
    other_targets: other_targets
  };
  
  const placement = {
    param_1: { prev: Number(document.getElementById('pes-place-1-prev').value) || 0, target: Number(document.getElementById('pes-place-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('pes-place-2-prev').value) || 0, target: Number(document.getElementById('pes-place-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('pes-place-3-prev').value) || 0, target: Number(document.getElementById('pes-place-3-target').value) || 0 }
  };
  
  const placement_plans = [];
  document.querySelectorAll('.pes-place-plan').forEach(input => {
    const val = input.value.trim();
    if (val) placement_plans.push(val);
  });
  
  const collaboration = {
    param_1: { prev: Number(document.getElementById('pes-collab-1-prev').value) || 0, target: Number(document.getElementById('pes-collab-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('pes-collab-2-prev').value) || 0, target: Number(document.getElementById('pes-collab-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('pes-collab-3-prev').value) || 0, target: Number(document.getElementById('pes-collab-3-target').value) || 0 },
    param_4: { prev: Number(document.getElementById('pes-collab-4-prev').value) || 0, target: Number(document.getElementById('pes-collab-4-target').value) || 0 },
    param_5: { prev: Number(document.getElementById('pes-collab-5-prev').value) || 0, target: Number(document.getElementById('pes-collab-5-target').value) || 0 },
    param_6: { prev: Number(document.getElementById('pes-collab-6-prev').value) || 0, target: Number(document.getElementById('pes-collab-6-target').value) || 0 },
    param_7: { prev: Number(document.getElementById('pes-collab-7-prev').value) || 0, target: Number(document.getElementById('pes-collab-7-target').value) || 0 }
  };
  
  const collaboration_plans = [];
  document.querySelectorAll('.pes-collab-plan').forEach(input => {
    const val = input.value.trim();
    if (val) collaboration_plans.push(val);
  });
  
  const payload = {
    department,
    academic_year,
    data: {
      major_research_areas,
      parameters,
      faculty_compliance,
      innovation_targets,
      placement,
      placement_plans,
      collaboration,
      collaboration_plans,
      hod_name: '' // Removed
    }
  };
  
  try {
    if (id) {
      await fetchAPI(`/pes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      alert("Scorecard updated successfully!");
    } else {
      await fetchAPI('/pes', { method: 'POST', body: JSON.stringify(payload) });
      alert("Scorecard registered successfully!");
    }
    hideStaffPesForm();
    await loadPesSubmissions();
    renderStaffPesPage();
  } catch (err) {
    console.error(err);
    alert("Error saving scorecard: " + err.message);
  }
}


// ---------------- USER FULL-SCREEN SCORECARD CONTROLLERS ----------------

function showUserPesForm() {
  document.getElementById('user-pes-scorecard-form').reset();
  document.getElementById('user-pes-edit-id').value = '';
  document.getElementById('user-pes-form-title').innerText = "Create Department Scorecard";
  
  // Set default values
  let userDept = '';
  if (state.currentUser && state.currentUser.role === 'User' && state.currentUser.name && state.currentUser.name !== 'Department User') {
    userDept = state.currentUser.name.trim();
  }
  document.getElementById('user-pes-form-dept').value = userDept;
  
  // Reset dynamically added rows
  document.getElementById('user-pes-research-areas-list').innerHTML = '';
  document.getElementById('user-pes-faculty-tbody').innerHTML = '';
  document.getElementById('user-pes-other-targets-list').innerHTML = '';
  document.getElementById('user-pes-placement-plans-list').innerHTML = '';
  document.getElementById('user-pes-collab-plans-list').innerHTML = '';
  
  // Populate initial dynamic inputs
  addUserPesResearchAreaRow();
  addUserPesResearchAreaRow();
  
  addUserPesFacultyRow();
  addUserPesFacultyRow();
  
  addUserPesPlacementPlanRow();
  addUserPesPlacementPlanRow();
  
  addUserPesCollabPlanRow();
  addUserPesCollabPlanRow();
  
  // Toggle UI panels
  document.getElementById('user-pes-form-container').style.display = 'block';
  document.getElementById('user-pes-table-container').style.display = 'none';
  
  // Always show back button
  document.getElementById('user-pes-cancel-btn').style.display = 'block';
}

function hideUserPesForm() {
  document.getElementById('user-pes-form-container').style.display = 'none';
  document.getElementById('user-pes-table-container').style.display = 'block';
}

function addUserPesResearchAreaRow(val = "") {
  const container = document.getElementById('user-pes-research-areas-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control user-pes-res-area" placeholder="e.g. Phytochemistry and Nanotechnology" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;">
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

let userFacultyRowCounter = 0;
function addUserPesFacultyRow(data = {}) {
  const tbody = document.getElementById('user-pes-faculty-tbody');
  if (!tbody) return;
  
  userFacultyRowCounter++;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 10px; text-align: center;" class="user-row-sno"></td>
    <td style="padding: 8px;">
      <input type="text" class="form-control user-pes-f-name" value="${escapeHtml(data.name || '')}" placeholder="Faculty Member Name" required style="height: 32px; padding: 4px 8px;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control user-pes-f-tlp-odd" value="${data.tlp_odd !== undefined ? data.tlp_odd : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control user-pes-f-tlp-even" value="${data.tlp_even !== undefined ? data.tlp_even : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control user-pes-f-assess-odd" value="${data.assess_odd !== undefined ? data.assess_odd : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control user-pes-f-assess-even" value="${data.assess_even !== undefined ? data.assess_even : 2}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px;">
      <input type="number" min="0" class="form-control user-pes-f-econtent" value="${data.econtent !== undefined ? data.econtent : 1}" required style="height: 32px; padding: 4px 8px; text-align: center;">
    </td>
    <td style="padding: 8px; text-align: center;">
      <button type="button" class="btn btn-danger btn-xs" onclick="deleteUserPesFacultyRow(this)" style="padding: 4px 8px; border-radius: 4px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
  updateUserPesFacultySNo();
}

function deleteUserPesFacultyRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    updateUserPesFacultySNo();
  }
}

function updateUserPesFacultySNo() {
  const tbody = document.getElementById('user-pes-faculty-tbody');
  if (!tbody) return;
  Array.from(tbody.children).forEach((tr, index) => {
    const snoCell = tr.querySelector('.user-row-sno');
    if (snoCell) snoCell.innerText = index + 1;
  });
}

function addUserPesOtherInnovationRow(specName = "", val = 0) {
  const container = document.getElementById('user-pes-other-targets-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '12px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control user-pes-other-target-spec" placeholder="Practice description" value="${escapeHtml(specName)}" style="height: 36px; padding-left: 10px; flex: 2;" required>
    <input type="number" min="0" class="form-control user-pes-other-target-val" placeholder="No. Planned" value="${val}" style="height: 36px; padding-left: 10px; flex: 1; text-align: center;" required>
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function addUserPesPlacementPlanRow(val = "") {
  const container = document.getElementById('user-pes-placement-plans-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control user-pes-place-plan" placeholder="e.g. Conduct Mock Placement interviews" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;">
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

function addUserPesCollabPlanRow(val = "") {
  const container = document.getElementById('user-pes-collab-plans-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control user-pes-collab-plan" placeholder="e.g. Sign MoUs with local biotech companies" value="${escapeHtml(val)}" style="height: 36px; padding-left: 10px; flex: 1;">
    <button type="button" class="btn btn-danger btn-xs" onclick="this.parentElement.remove()" style="padding: 8px 12px; border-radius: 6px;">Delete</button>
  `;
  container.appendChild(div);
}

async function saveUserPesScorecard(e) {
  e.preventDefault();
  
  const department = document.getElementById('user-pes-form-dept').value.trim();
  const id = document.getElementById('user-pes-edit-id').value;
  
  if (!department) {
    alert("Department Name is required!");
    return;
  }
  
  const major_research_areas = [];
  document.querySelectorAll('.user-pes-res-area').forEach(input => {
    const val = input.value.trim();
    if (val) major_research_areas.push(val);
  });
  
  const parameters = {
    param_1: { prev: Number(document.getElementById('user-pes-param-1-prev').value) || 0, target: Number(document.getElementById('user-pes-param-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('user-pes-param-2-prev').value) || 0, target: Number(document.getElementById('user-pes-param-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('user-pes-param-3-prev').value) || 0, target: Number(document.getElementById('user-pes-param-3-target').value) || 0 },
    param_4: { prev: Number(document.getElementById('user-pes-param-4-prev').value) || 0, target: Number(document.getElementById('user-pes-param-4-target').value) || 0 },
    param_5: { prev: Number(document.getElementById('user-pes-param-5-prev').value) || 0, target: Number(document.getElementById('user-pes-param-5-target').value) || 0 },
    param_6a: { prev: Number(document.getElementById('user-pes-param-6a-prev').value) || 0, target: Number(document.getElementById('user-pes-param-6a-target').value) || 0 },
    param_6b: { prev: Number(document.getElementById('user-pes-param-6b-prev').value) || 0, target: Number(document.getElementById('user-pes-param-6b-target').value) || 0 },
    param_7: { prev: Number(document.getElementById('user-pes-param-7-prev').value) || 0, target: Number(document.getElementById('user-pes-param-7-target').value) || 0 },
    param_8: { prev: Number(document.getElementById('user-pes-param-8-prev').value) || 0, target: Number(document.getElementById('user-pes-param-8-target').value) || 0 },
    param_9: { prev: Number(document.getElementById('user-pes-param-9-prev').value) || 0, target: Number(document.getElementById('user-pes-param-9-target').value) || 0 },
    param_10: { prev: Number(document.getElementById('user-pes-param-10-prev').value) || 0, target: Number(document.getElementById('user-pes-param-10-target').value) || 0 },
    param_11: { prev: Number(document.getElementById('user-pes-param-11-prev').value) || 0, target: Number(document.getElementById('user-pes-param-11-target').value) || 0 },
    param_12: { prev: Number(document.getElementById('user-pes-param-12-prev').value) || 0, target: Number(document.getElementById('user-pes-param-12-target').value) || 0 },
    param_13: { prev: Number(document.getElementById('user-pes-param-13-prev').value) || 0, target: Number(document.getElementById('user-pes-param-13-target').value) || 0 }
  };
  
  const faculty_compliance = [];
  document.querySelectorAll('#user-pes-faculty-tbody tr').forEach(tr => {
    const name = tr.querySelector('.user-pes-f-name').value.trim();
    const tlp_odd = Number(tr.querySelector('.user-pes-f-tlp-odd').value) || 0;
    const tlp_even = Number(tr.querySelector('.user-pes-f-tlp-even').value) || 0;
    const assess_odd = Number(tr.querySelector('.user-pes-f-assess-odd').value) || 0;
    const assess_even = Number(tr.querySelector('.user-pes-f-assess-even').value) || 0;
    const econtent = Number(tr.querySelector('.user-pes-f-econtent').value) || 0;
    if (name) {
      faculty_compliance.push({ name, tlp_odd, tlp_even, assess_odd, assess_even, econtent });
    }
  });
  
  const other_targets = [];
  document.querySelectorAll('#user-pes-other-targets-list > div').forEach(div => {
    const spec = div.querySelector('.user-pes-other-target-spec').value.trim();
    const count = Number(div.querySelector('.user-pes-other-target-val').value) || 0;
    if (spec) {
      other_targets.push({ spec, count });
    }
  });
  
  const innovation_targets = {
    target_1: Number(document.getElementById('user-pes-target-1').value) || 0,
    target_2: Number(document.getElementById('user-pes-target-2').value) || 0,
    target_3: Number(document.getElementById('user-pes-target-3').value) || 0,
    target_4: Number(document.getElementById('user-pes-target-4').value) || 0,
    target_5: Number(document.getElementById('user-pes-target-5').value) || 0,
    target_6: Number(document.getElementById('user-pes-target-6').value) || 0,
    target_7: Number(document.getElementById('user-pes-target-7').value) || 0,
    target_8: Number(document.getElementById('user-pes-target-8').value) || 0,
    target_9: Number(document.getElementById('user-pes-target-9').value) || 0,
    
    // Store first specify in target_10 for backward compatibility
    target_10_spec: other_targets[0] ? other_targets[0].spec : '',
    target_10: other_targets[0] ? other_targets[0].count : 0,
    other_targets: other_targets // Complete dynamic specifications list
  };
  
  const placement = {
    param_1: { prev: Number(document.getElementById('user-pes-place-1-prev').value) || 0, target: Number(document.getElementById('user-pes-place-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('user-pes-place-2-prev').value) || 0, target: Number(document.getElementById('user-pes-place-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('user-pes-place-3-prev').value) || 0, target: Number(document.getElementById('user-pes-place-3-target').value) || 0 }
  };
  
  const placement_plans = [];
  document.querySelectorAll('.user-pes-place-plan').forEach(input => {
    const val = input.value.trim();
    if (val) placement_plans.push(val);
  });
  
  const collaboration = {
    param_1: { prev: Number(document.getElementById('user-pes-collab-1-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-1-target').value) || 0 },
    param_2: { prev: Number(document.getElementById('user-pes-collab-2-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-2-target').value) || 0 },
    param_3: { prev: Number(document.getElementById('user-pes-collab-3-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-3-target').value) || 0 },
    param_4: { prev: Number(document.getElementById('user-pes-collab-4-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-4-target').value) || 0 },
    param_5: { prev: Number(document.getElementById('user-pes-collab-5-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-5-target').value) || 0 },
    param_6: { prev: Number(document.getElementById('user-pes-collab-6-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-6-target').value) || 0 },
    param_7: { prev: Number(document.getElementById('user-pes-collab-7-prev').value) || 0, target: Number(document.getElementById('user-pes-collab-7-target').value) || 0 }
  };
  
  const collaboration_plans = [];
  document.querySelectorAll('.user-pes-collab-plan').forEach(input => {
    const val = input.value.trim();
    if (val) collaboration_plans.push(val);
  });
  
  const payload = {
    department,
    academic_year: '2026-2027', // Default Year
    data: {
      major_research_areas,
      parameters,
      faculty_compliance,
      innovation_targets,
      placement,
      placement_plans,
      collaboration,
      collaboration_plans,
      hod_name: ''
    }
  };
  
  try {
    if (id) {
      await fetchAPI(`/pes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      alert("Performance Scorecard updated successfully!");
    } else {
      await fetchAPI('/pes', { method: 'POST', body: JSON.stringify(payload) });
      alert("Performance Scorecard submitted successfully!");
    }
    await loadPesSubmissions();
    renderUserPesPage();
  } catch (err) {
    console.error("Failed to save user PES scorecard:", err);
    alert(err.message || "Failed to submit scorecard.");
  }
}

function editUserPesScorecard(id) {
  const pes = state.pesSubmissions.find(p => p.id == id);
  if (!pes) return;
  
  document.getElementById('user-pes-scorecard-form').reset();
  document.getElementById('user-pes-edit-id').value = pes.id;
  document.getElementById('user-pes-form-title').innerText = "Edit Department Scorecard";
  document.getElementById('user-pes-form-dept').value = pes.department;
  
  // Clear lists
  document.getElementById('user-pes-research-areas-list').innerHTML = '';
  document.getElementById('user-pes-faculty-tbody').innerHTML = '';
  document.getElementById('user-pes-other-targets-list').innerHTML = '';
  document.getElementById('user-pes-placement-plans-list').innerHTML = '';
  document.getElementById('user-pes-collab-plans-list').innerHTML = '';
  
  const data = pes.data || {};
  
  // Fill Major Research Areas
  const areas = data.major_research_areas || [];
  if (areas.length > 0) {
    areas.forEach(a => addUserPesResearchAreaRow(a));
  } else {
    addUserPesResearchAreaRow();
  }
  
  // Fill Parameters
  const params = data.parameters || {};
  for (let k in params) {
    const elPrev = document.getElementById(`user-pes-param-${k.replace('param_', '')}-prev`);
    const elTarget = document.getElementById(`user-pes-param-${k.replace('param_', '')}-target`);
    if (elPrev) elPrev.value = params[k].prev || 0;
    if (elTarget) elTarget.value = params[k].target || 0;
  }
  
  // Fill Faculty compliance
  const facultyList = data.faculty_compliance || [];
  if (facultyList.length > 0) {
    facultyList.forEach(fac => addUserPesFacultyRow(fac));
  } else {
    addUserPesFacultyRow(); addUserPesFacultyRow();
  }
  
  // Fill Innovation Targets
  const targets = data.innovation_targets || {};
  for (let i = 1; i <= 9; i++) {
    const el = document.getElementById(`user-pes-target-${i}`);
    if (el) el.value = targets[`target_${i}`] || 0;
  }
  
  // Fill specifies other targets
  const otherTargets = targets.other_targets || [];
  if (otherTargets.length > 0) {
    otherTargets.forEach(t => addUserPesOtherInnovationRow(t.spec, t.count));
  } else if (targets.target_10_spec) {
    addUserPesOtherInnovationRow(targets.target_10_spec, targets.target_10);
  }
  
  // Fill Placement Parameters
  const place = data.placement || {};
  for (let i = 1; i <= 3; i++) {
    const elPrev = document.getElementById(`user-pes-place-${i}-prev`);
    const elTarget = document.getElementById(`user-pes-place-${i}-target`);
    if (elPrev) elPrev.value = place[`param_${i}`] ? place[`param_${i}`].prev : 0;
    if (elTarget) elTarget.value = place[`param_${i}`] ? place[`param_${i}`].target : 0;
  }
  
  // Fill Placement plans
  const placementPlans = data.placement_plans || [];
  if (placementPlans.length > 0) {
    placementPlans.forEach(p => addUserPesPlacementPlanRow(p));
  } else {
    addUserPesPlacementPlanRow();
  }
  
  // Fill Collab Parameters
  const collab = data.collaboration || {};
  for (let i = 1; i <= 7; i++) {
    const elPrev = document.getElementById(`user-pes-collab-${i}-prev`);
    const elTarget = document.getElementById(`user-pes-collab-${i}-target`);
    if (elPrev) elPrev.value = collab[`param_${i}`] ? collab[`param_${i}`].prev : 0;
    if (elTarget) elTarget.value = collab[`param_${i}`] ? collab[`param_${i}`].target : 0;
  }
  
  // Fill Collab plans
  const collabPlans = data.collaboration_plans || [];
  if (collabPlans.length > 0) {
    collabPlans.forEach(c => addUserPesCollabPlanRow(c));
  } else {
    addUserPesCollabPlanRow();
  }
  
  // Show UI panels
  document.getElementById('user-pes-form-container').style.display = 'block';
  document.getElementById('user-pes-table-container').style.display = 'none';
  document.getElementById('user-pes-cancel-btn').style.display = 'block';
}

async function deleteUserPesScorecard(id) {
  const confirmed = await showCustomConfirm(
    "Are you sure you want to delete this scorecard? This action cannot be undone.",
    "Delete Scorecard",
    "danger",
    "Yes, Delete",
    "Cancel"
  );
  if (!confirmed) return;
  
  try {
    await fetchAPI(`/pes/${id}`, { method: 'DELETE' });
    alert("Scorecard deleted successfully!");
    await loadPesSubmissions();
    renderUserPesPage();
  } catch (err) {
    console.error("Failed to delete scorecard:", err);
    alert(err.message || "Failed to delete scorecard");
  }
}

function renderUserPesPage() {
  const tbody = document.getElementById('user-pes-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  let userDept = '';
  if (state.currentUser && state.currentUser.role === 'User' && state.currentUser.name && state.currentUser.name !== 'Department User') {
    userDept = state.currentUser.name.trim();
  }
  
  // Filter user registered data
  const isGeneralUser = (userDept.toLowerCase().includes('user') || userDept === '');
  const submissions = isGeneralUser ? state.pesSubmissions : state.pesSubmissions.filter(p => p.department.toLowerCase() === userDept.toLowerCase());
  
  if (submissions.length === 0) {
    // If no submissions exist, immediately open full screen form directly
    showUserPesForm();
    return;
  }
  
  // Hide form, show registry list table
  document.getElementById('user-pes-form-container').style.display = 'none';
  document.getElementById('user-pes-table-container').style.display = 'block';
  
  submissions.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e5e7eb';
    tr.innerHTML = `
      <td style="padding: 12px 16px; font-weight: 500;">${idx + 1}</td>
      <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
      <td style="padding: 12px 16px; text-align: center;">
        <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
          <button class="btn btn-secondary btn-xs" onclick="viewPesScorecardDetails(${p.id})" title="View Details" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View
          </button>
          <button class="btn btn-primary btn-xs" onclick="editUserPesScorecard(${p.id})" title="Edit Details" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Edit
          </button>
          <button class="btn btn-danger btn-xs" onclick="deleteUserPesScorecard(${p.id})" title="Delete" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// ---------------- STAFF REPORT AND DASHBOARD FILTER CONTROLLER ----------------

function renderStaffPesPage() {
  const tbody = document.getElementById('staff-pes-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  // Dynamic Department Dropdown: Populate ONLY with registered scorecard departments
  const deptSelect = document.getElementById('staff-pes-filter-dept');
  if (deptSelect) {
    const registeredDepts = [...new Set(state.pesSubmissions.map(p => p.department))].filter(Boolean).sort();
    deptSelect.innerHTML = '<option value="">All Registered Departments</option>' +
      registeredDepts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  }
  
  // Clear parameter-specific filters if we are resetting
  applyPesFilters();
}

// ---------------- MUTUAL EXCLUSION FILTER HANDLERS ----------------
function onResParamFilterChange() {
  document.getElementById('staff-pes-filter-tlp-search').value = '';
  document.getElementById('staff-pes-filter-innovation').value = '';
  document.getElementById('staff-pes-filter-placement').value = '';
  document.getElementById('staff-pes-filter-collab').value = '';
  applyPesFilters();
}

function onTlpSearchChange() {
  document.getElementById('staff-pes-filter-res-param').value = '';
  document.getElementById('staff-pes-filter-innovation').value = '';
  document.getElementById('staff-pes-filter-placement').value = '';
  document.getElementById('staff-pes-filter-collab').value = '';
  applyPesFilters();
}

function onInnovationFilterChange() {
  document.getElementById('staff-pes-filter-res-param').value = '';
  document.getElementById('staff-pes-filter-tlp-search').value = '';
  document.getElementById('staff-pes-filter-placement').value = '';
  document.getElementById('staff-pes-filter-collab').value = '';
  applyPesFilters();
}

function onPlacementFilterChange() {
  document.getElementById('staff-pes-filter-res-param').value = '';
  document.getElementById('staff-pes-filter-tlp-search').value = '';
  document.getElementById('staff-pes-filter-innovation').value = '';
  document.getElementById('staff-pes-filter-collab').value = '';
  applyPesFilters();
}

function onCollabFilterChange() {
  document.getElementById('staff-pes-filter-res-param').value = '';
  document.getElementById('staff-pes-filter-tlp-search').value = '';
  document.getElementById('staff-pes-filter-innovation').value = '';
  document.getElementById('staff-pes-filter-placement').value = '';
  applyPesFilters();
}

function clearAllPesFilters() {
  document.getElementById('staff-pes-filter-dept').value = '';
  document.getElementById('staff-pes-filter-res-param').value = '';
  document.getElementById('staff-pes-filter-tlp-search').value = '';
  document.getElementById('staff-pes-filter-innovation').value = '';
  document.getElementById('staff-pes-filter-placement').value = '';
  document.getElementById('staff-pes-filter-collab').value = '';
  applyPesFilters();
}

function applyPesFilters() {
  const tbody = document.getElementById('staff-pes-table-body');
  const thead = document.getElementById('staff-pes-table-head');
  const titleEl = document.getElementById('staff-pes-table-title');
  if (!tbody || !thead) return;
  tbody.innerHTML = '';
  
  const deptFilter = document.getElementById('staff-pes-filter-dept').value;
  const resParamFilter = document.getElementById('staff-pes-filter-res-param').value;
  const tlpSearchFilter = document.getElementById('staff-pes-filter-tlp-search').value.toLowerCase().trim();
  const innovationFilter = document.getElementById('staff-pes-filter-innovation').value;
  const placementFilter = document.getElementById('staff-pes-filter-placement').value;
  const collabFilter = document.getElementById('staff-pes-filter-collab').value;
  
  let filtered = state.pesSubmissions;
  
  // Apply department filter
  if (deptFilter) {
    filtered = filtered.filter(p => p.department === deptFilter);
  }
  
  // Case A: Research Parameter dropdown selection
  if (resParamFilter) {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) {
      titleEl.style.display = 'block';
      titleEl.innerText = "SECTION 1: RESEARCH, TEACHING EXCELLENCE, AND INNOVATION";
    }
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Research Parameter</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Previous Year (2025–26)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Target for 2026–27</th>
      </tr>
    `;
    
    const paramMapping = {
      "Research Publications": { index: 1, isNumeric: true },
      "Books Published": { index: 2, isNumeric: true },
      "Book Chapters Published": { index: 3, isNumeric: true },
      "Conference Proceedings": { index: 4, isNumeric: true },
      "Average Departmental H-index": { index: 5, isNumeric: true },
      "Research Projects": { isProjects: true },
      "Patent Applications Submitted": { index: 7, isNumeric: true },
      "Patents Granted": { index: 8, isNumeric: true },
      "Copyrights Filed": { index: 9, isNumeric: true },
      "Product Development Projects": { index: 10, isNumeric: true },
      "Prototypes Developed": { index: 11, isNumeric: true },
      "Start-ups Incubated": { index: 12, isNumeric: true },
      "Technology Transfer Initiatives": { index: 13, isNumeric: true }
    };
    
    const param = paramMapping[resParamFilter];
    let totals = { prev: 0, target: 0 };
    let rowIdx = 1;
    
    filtered.forEach(p => {
      const data = p.data || {};
      const params = data.parameters || {};
      let prevVal = 0;
      let targetVal = 0;
      
      if (param.isNumeric) {
        const key = `param_${param.index}`;
        prevVal = params[key] ? Number(params[key].prev) || 0 : 0;
        targetVal = params[key] ? Number(params[key].target) || 0 : 0;
        totals.prev += prevVal;
        totals.target += targetVal;
      } else if (param.isProjects) {
        prevVal = (params.param_6a ? Number(params.param_6a.prev) || 0 : 0) + (params.param_6b ? Number(params.param_6b.prev) || 0 : 0);
        targetVal = (params.param_6a ? Number(params.param_6a.target) || 0 : 0) + (params.param_6b ? Number(params.param_6b.target) || 0 : 0);
        totals.prev += prevVal;
        totals.target += targetVal;
      }
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e5e7eb';
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${rowIdx++}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(resParamFilter)}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #1e40af;">${prevVal}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #0f766e;">${targetVal}</td>
      `;
      tbody.appendChild(tr);
    });
    
    const trTotal = document.createElement('tr');
    trTotal.style.background = '#f9fafb';
    trTotal.style.fontWeight = '700';
    trTotal.style.borderTop = '2px solid #d1d5db';
    trTotal.innerHTML = `
      <td></td>
      <td style="padding: 12px 16px;">Total of Filtered Data</td>
      <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(resParamFilter)}</td>
      <td style="padding: 12px 16px; text-align: center; color: #1e40af;">${totals.prev}</td>
      <td style="padding: 12px 16px; text-align: center; color: #0f766e;">${totals.target}</td>
    `;
    tbody.appendChild(trTotal);
  }
  
  // Case B: Teaching-Learning Pedagogy text search
  else if (tlpSearchFilter) {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) {
      titleEl.style.display = 'block';
      titleEl.innerText = "SECTION 2: TEACHING-LEARNING PEDAGOGY (TLP)";
    }
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Faculty Name</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main);">TLPs Planned (Odd)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main);">TLPs Planned (Even)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main);">Assessments (Odd)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main);">Assessments (Even)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main);">E-Content (4 Q)</th>
      </tr>
    `;
    
    let totals = { tlpOdd: 0, tlpEven: 0, assOdd: 0, assEven: 0, econ: 0 };
    let rowIdx = 1;
    
    filtered.forEach(p => {
      const data = p.data || {};
      const facultyList = data.faculty_compliance || [];
      facultyList.forEach(f => {
        if (f.name.toLowerCase().includes(tlpSearchFilter)) {
          totals.tlpOdd += Number(f.tlp_odd) || 0;
          totals.tlpEven += Number(f.tlp_even) || 0;
          totals.assOdd += Number(f.assess_odd) || 0;
          totals.assEven += Number(f.assess_even) || 0;
          totals.econ += Number(f.econtent) || 0;
          
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #e5e7eb';
          tr.innerHTML = `
            <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${rowIdx++}</td>
            <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
            <td style="padding: 12px 16px; font-weight: 600;">${escapeHtml(f.name)}</td>
            <td style="padding: 12px 16px; text-align: center;">${f.tlp_odd}</td>
            <td style="padding: 12px 16px; text-align: center;">${f.tlp_even}</td>
            <td style="padding: 12px 16px; text-align: center;">${f.assess_odd}</td>
            <td style="padding: 12px 16px; text-align: center;">${f.assess_even}</td>
            <td style="padding: 12px 16px; text-align: center;">${f.econtent}</td>
          `;
          tbody.appendChild(tr);
        }
      });
    });
    
    if (rowIdx > 1) {
      const trTotal = document.createElement('tr');
      trTotal.style.background = '#f9fafb';
      trTotal.style.fontWeight = '700';
      trTotal.style.borderTop = '2px solid #d1d5db';
      trTotal.innerHTML = `
        <td></td>
        <td colspan="2" style="padding: 12px 16px;">Total of Filtered Data</td>
        <td style="padding: 12px 16px; text-align: center; color: #1e40af;">${totals.tlpOdd}</td>
        <td style="padding: 12px 16px; text-align: center; color: #1e40af;">${totals.tlpEven}</td>
        <td style="padding: 12px 16px; text-align: center; color: #0f766e;">${totals.assOdd}</td>
        <td style="padding: 12px 16px; text-align: center; color: #0f766e;">${totals.assEven}</td>
        <td style="padding: 12px 16px; text-align: center; color: var(--primary);">${totals.econ}</td>
      `;
      tbody.appendChild(trTotal);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="padding: 20px; text-align: center; color: var(--text-muted);">No faculty records match your search.</td></tr>`;
    }
  }
  
  // Case C: Department Teaching Innovation Targets selected
  else if (innovationFilter) {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) {
      titleEl.style.display = 'block';
      titleEl.innerText = "SECTION 2: DEPARTMENT TEACHING INNOVATION TARGETS";
    }
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Teaching-Learning Practice</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Number Planned</th>
      </tr>
    `;
    
    const targetsMapping = {
      "Flipped Classroom Sessions": 1,
      "Project-Based Learning Activities": 2,
      "Problem-Based Learning Activities": 3,
      "Experiential Learning Activities": 4,
      "ICT-Enabled Teaching Sessions": 5,
      "AI-Assisted Learning Activities": 6,
      "Peer Learning Activities": 7,
      "Case Study-Based Teaching": 8,
      "Field-Based Learning Activities": 9,
      "Any other - specify": 10
    };
    
    const index = targetsMapping[innovationFilter];
    let totalPlanned = 0;
    let rowIdx = 1;
    
    filtered.forEach(p => {
      const data = p.data || {};
      const targets = data.innovation_targets || {};
      let num = 0;
      let label = innovationFilter;
      
      if (index === 10) {
        num = Number(targets.target_10) || 0;
        label = targets.target_10_spec ? `Any other: ${targets.target_10_spec}` : "Any other (unspecified)";
      } else {
        num = Number(targets[`target_${index}`]) || 0;
      }
      
      totalPlanned += num;
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e5e7eb';
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${rowIdx++}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(label)}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: var(--primary);">${num}</td>
      `;
      tbody.appendChild(tr);
    });
    
    const trTotal = document.createElement('tr');
    trTotal.style.background = '#f9fafb';
    trTotal.style.fontWeight = '700';
    trTotal.style.borderTop = '2px solid #d1d5db';
    trTotal.innerHTML = `
      <td></td>
      <td style="padding: 12px 16px;">Total of Filtered Data</td>
      <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(innovationFilter)}</td>
      <td style="padding: 12px 16px; text-align: center; color: var(--primary);">${totalPlanned}</td>
    `;
    tbody.appendChild(trTotal);
  }
  
  // Case D: Placement and Career Development dropdown selection
  else if (placementFilter) {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) {
      titleEl.style.display = 'block';
      titleEl.innerText = "SECTION 3: PLACEMENT AND CAREER DEVELOPMENT";
    }
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Placement Parameter</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Previous Year (2025–26)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Target for 2026–27</th>
      </tr>
    `;
    
    const placeMapping = {
      "MoUs created for Placements / Projects / Internships": 1,
      "Placement Training Programmes": 2,
      "Industry Interaction / Training Sessions": 3
    };
    
    const index = placeMapping[placementFilter];
    let totals = { prev: 0, target: 0 };
    let rowIdx = 1;
    
    filtered.forEach(p => {
      const data = p.data || {};
      const placementData = data.placement || {};
      const key = `param_${index}`;
      const prevVal = placementData[key] ? Number(placementData[key].prev) || 0 : 0;
      const targetVal = placementData[key] ? Number(placementData[key].target) || 0 : 0;
      
      totals.prev += prevVal;
      totals.target += targetVal;
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e5e7eb';
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${rowIdx++}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(placementFilter)}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #1e40af;">${prevVal}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #0f766e;">${targetVal}</td>
      `;
      tbody.appendChild(tr);
    });
    
    const trTotal = document.createElement('tr');
    trTotal.style.background = '#f9fafb';
    trTotal.style.fontWeight = '700';
    trTotal.style.borderTop = '2px solid #d1d5db';
    trTotal.innerHTML = `
      <td></td>
      <td style="padding: 12px 16px;">Total of Filtered Data</td>
      <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(placementFilter)}</td>
      <td style="padding: 12px 16px; text-align: center; color: #1e40af;">${totals.prev}</td>
      <td style="padding: 12px 16px; text-align: center; color: #0f766e;">${totals.target}</td>
    `;
    tbody.appendChild(trTotal);
  }
  
  // Case E: Industry-Academia Collaboration dropdown selection
  else if (collabFilter) {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) {
      titleEl.style.display = 'block';
      titleEl.innerText = "SECTION 4: INDUSTRY-ACADEMIA COLLABORATION";
    }
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Collaboration Parameter</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Previous Year (2025–26)</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Target for 2026–27</th>
      </tr>
    `;
    
    const collabMapping = {
      "MoUs Signed": 1,
      "Active MoUs": 2,
      "Industry Experts Invited": 3,
      "Industrial Visits Conducted": 4,
      "Industry - Sponsored Research Projects": 5,
      "Consultancy Assignments": 6,
      "Joint Publications with Industry": 7
    };
    
    const index = collabMapping[collabFilter];
    let totals = { prev: 0, target: 0 };
    let rowIdx = 1;
    
    filtered.forEach(p => {
      const data = p.data || {};
      const collabData = data.collaboration || {};
      const key = `param_${index}`;
      const prevVal = collabData[key] ? Number(collabData[key].prev) || 0 : 0;
      const targetVal = collabData[key] ? Number(collabData[key].target) || 0 : 0;
      
      totals.prev += prevVal;
      totals.target += targetVal;
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e5e7eb';
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${rowIdx++}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(collabFilter)}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #1e40af;">${prevVal}</td>
        <td style="padding: 12px 16px; text-align: center; font-weight: 600; color: #0f766e;">${targetVal}</td>
      `;
      tbody.appendChild(tr);
    });
    
    const trTotal = document.createElement('tr');
    trTotal.style.background = '#f9fafb';
    trTotal.style.fontWeight = '700';
    trTotal.style.borderTop = '2px solid #d1d5db';
    trTotal.innerHTML = `
      <td></td>
      <td style="padding: 12px 16px;">Total of Filtered Data</td>
      <td style="padding: 12px 16px; font-style: italic;">${escapeHtml(collabFilter)}</td>
      <td style="padding: 12px 16px; text-align: center; color: #1e40af;">${totals.prev}</td>
      <td style="padding: 12px 16px; text-align: center; color: #0f766e;">${totals.target}</td>
    `;
    tbody.appendChild(trTotal);
  }
  
  // Case F: Default summary view (no parameter filters active)
  else {
    const totalRowEl = document.getElementById('staff-pes-total-row');
    if (totalRowEl) totalRowEl.style.display = 'none';
    if (titleEl) titleEl.style.display = 'none';
    
    thead.innerHTML = `
      <tr style="background: var(--bg-light); border-bottom: 2px solid #e5e7eb;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main); width: 60px;">S.No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 700; color: var(--text-main);">Department Name</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 700; color: var(--text-main); width: 220px;">Actions</th>
      </tr>
    `;
    
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="padding: 20px; text-align: center; color: var(--text-muted);">No scorecard entries match your filters.</td></tr>`;
      updatePesSummaryTotals(null);
      return;
    }
    
    filtered.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e5e7eb';
      
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 500; text-align: center;">${idx + 1}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: var(--text-main);">${escapeHtml(p.department)}</td>
        <td style="padding: 12px 16px; text-align: center;">
          <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
            <button class="btn btn-secondary btn-xs" onclick="viewPesScorecardDetails(${p.id})" title="View Details" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View
            </button>
            <button class="btn btn-primary btn-xs" onclick="openEditPesModal(${p.id})" title="Edit Details" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Edit
            </button>
            <button class="btn btn-danger btn-xs" onclick="deletePesScorecard(${p.id})" title="Delete" style="padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    updatePesSummaryTotals(null);
  }
}

function updatePesSummaryTotals(totals) {
  const pubCell = document.getElementById('staff-pes-total-pub');
  const booksCell = document.getElementById('staff-pes-total-books');
  const projCell = document.getElementById('staff-pes-total-projects');
  const mouCell = document.getElementById('staff-pes-total-mous');
  
  if (!pubCell || !booksCell || !projCell || !mouCell) return;
  
  if (!totals) {
    pubCell.innerText = '0 / 0';
    booksCell.innerText = '0 / 0';
    projCell.innerText = '0 / 0';
    mouCell.innerText = '0 / 0';
    return;
  }
  pubCell.innerText = `${totals.pubPrev} / ${totals.pubTarget}`;
  booksCell.innerText = `${totals.booksPrev} / ${totals.booksTarget}`;
  projCell.innerText = `${totals.projPrev} / ${totals.projTarget}`;
  mouCell.innerText = `${totals.mouPrev} / ${totals.mouTarget}`;
}

function exportUserPesExcel() {
  let userDept = '';
  if (state.currentUser && state.currentUser.role === 'User' && state.currentUser.name && state.currentUser.name !== 'Department User') {
    userDept = state.currentUser.name.trim();
  }
  const isGeneralUser = (userDept.toLowerCase().includes('user') || userDept === '');
  const filtered = isGeneralUser ? state.pesSubmissions : state.pesSubmissions.filter(p => p.department.toLowerCase() === userDept.toLowerCase());
  exportPesExcelData(filtered, `user_pes_scorecard_${userDept.replace(/\s+/g, '_') || 'department'}.csv`);
}

function exportStaffPesExcel() {
  try {
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };
    
    let csvRows = [];
    csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
    csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
    csvRows.push([escapeCsv("Performance & Excellence Scorecard (PES) Report")]);
    csvRows.push([]);
    
    // Extract headers from DOM
    const ths = Array.from(document.querySelectorAll('#staff-pes-table-head th'));
    const headers = ths.map(th => th.innerText.trim());
    
    // Extract rows from DOM
    const trs = Array.from(document.querySelectorAll('#staff-pes-table-body tr'));
    const rows = trs.map(tr => {
      return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    
    // If the last column header is "Actions", remove it
    if (headers[headers.length - 1] === "Actions" || headers[headers.length - 1] === "Action") {
      headers.pop();
      rows.forEach(row => row.pop());
    }
    
    csvRows.push(headers.map(escapeCsv).join(','));
    rows.forEach(row => {
      csvRows.push(row.map(escapeCsv).join(','));
    });
    
    // Append footer total row if visible
    const resParamFilter = document.getElementById('staff-pes-filter-res-param').value;
    const tlpSearchFilter = document.getElementById('staff-pes-filter-tlp-search').value.trim();
    const innovationFilter = document.getElementById('staff-pes-filter-innovation').value;
    const placementFilter = document.getElementById('staff-pes-filter-placement').value;
    const collabFilter = document.getElementById('staff-pes-filter-collab').value;
    
    const footRow = document.getElementById('staff-pes-total-row');
    if (footRow && footRow.style.display !== 'none' && !resParamFilter && !tlpSearchFilter && !innovationFilter && !placementFilter && !collabFilter) {
      const tds = Array.from(footRow.querySelectorAll('td'));
      if (tds.length >= 7) {
        const footData = [
          'Total',
          'Total of Filtered Data',
          '',
          tds[3] ? tds[3].innerText.trim() : '',
          tds[4] ? tds[4].innerText.trim() : '',
          tds[5] ? tds[5].innerText.trim() : '',
          tds[6] ? tds[6].innerText.trim() : ''
        ];
        csvRows.push(footData.map(escapeCsv).join(','));
      }
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff_pes_scorecards_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to export Excel:", err);
    alert("Failed to export Excel: " + err.message);
  }
}

function exportStaffPesPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape A4
    
    const marginX = 15;
    let currentY = 15;
    
    // Add header logo if exists
    const logoImg = document.querySelector('.letter-header-logo');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width;
        canvas.height = logoImg.naturalHeight || logoImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', marginX, currentY, 15, 25);
      } catch(e) {}
    }
    
    doc.setFont("Times", "bold");
    doc.setFontSize(14);
    doc.text("St. Joseph's College (Autonomous)", 148, currentY + 5, { align: "center" });
    doc.setFontSize(12);
    doc.text("Internal Quality Assurance Cell (IQAC)", 148, currentY + 11, { align: "center" });
    doc.setFontSize(13);
    doc.text("Performance & Excellence Scorecard (PES) Report", 148, currentY + 17, { align: "center" });
    
    // Add active filter subtitle if any
    let activeFilterDesc = "Overall Summary";
    const resParamFilter = document.getElementById('staff-pes-filter-res-param').value;
    const tlpSearchFilter = document.getElementById('staff-pes-filter-tlp-search').value.trim();
    const innovationFilter = document.getElementById('staff-pes-filter-innovation').value;
    const placementFilter = document.getElementById('staff-pes-filter-placement').value;
    const collabFilter = document.getElementById('staff-pes-filter-collab').value;
    
    if (resParamFilter) activeFilterDesc = `Filtered by Research Parameter: ${resParamFilter}`;
    else if (tlpSearchFilter) activeFilterDesc = `Filtered by TLP Search: "${tlpSearchFilter}"`;
    else if (innovationFilter) activeFilterDesc = `Filtered by Teaching Innovation Target: ${innovationFilter}`;
    else if (placementFilter) activeFilterDesc = `Filtered by Placement Parameter: ${placementFilter}`;
    else if (collabFilter) activeFilterDesc = `Filtered by Collaboration Parameter: ${collabFilter}`;
    
    doc.setFont("Times", "normal");
    doc.setFontSize(11);
    doc.text(activeFilterDesc, 148, currentY + 23, { align: "center" });
    
    currentY += 28;
    
    // Extract headers from DOM
    const ths = Array.from(document.querySelectorAll('#staff-pes-table-head th'));
    const headers = [ths.map(th => th.innerText.trim())];
    
    // Extract rows from DOM
    const trs = Array.from(document.querySelectorAll('#staff-pes-table-body tr'));
    const rows = trs.map(tr => {
      return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    
    // If the last column header is "Actions", remove it
    const lastHeader = headers[0][headers[0].length - 1];
    if (lastHeader === "Actions" || lastHeader === "Action") {
      headers[0].pop();
      rows.forEach(row => row.pop());
    }
    
    // Append footer total row if visible
    const footRow = document.getElementById('staff-pes-total-row');
    if (footRow && footRow.style.display !== 'none' && !resParamFilter && !tlpSearchFilter && !innovationFilter && !placementFilter && !collabFilter) {
      const tds = Array.from(footRow.querySelectorAll('td'));
      if (tds.length >= 7) {
        const footData = [
          'Total',
          'Total of Filtered Data',
          '',
          tds[3] ? tds[3].innerText.trim() : '',
          tds[4] ? tds[4].innerText.trim() : '',
          tds[5] ? tds[5].innerText.trim() : '',
          tds[6] ? tds[6].innerText.trim() : ''
        ];
        rows.push(footData);
      }
    }
    
    doc.autoTable({
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: headers,
      body: rows,
      theme: 'grid',
      styles: { font: 'Times', fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.15 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
      didParseCell: function (data) {
        const isTotalRow = data.row.index === rows.length - 1 && (data.row.raw[0] === 'Total' || data.row.raw[1] === 'Total of Filtered Data');
        if (isTotalRow) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [243, 244, 246];
        }
      }
    });
    
    doc.save('staff_pes_scorecards_summary.pdf');
  } catch (err) {
    console.error("Failed to generate PDF summary:", err);
    alert("Failed to generate PDF: " + err.message);
  }
}

function exportPesExcelData(list, filename) {
  try {
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };
    
    let csvRows = [];
    csvRows.push([escapeCsv("St. Joseph's College (Autonomous), Tiruchirappalli - 620 002")]);
    csvRows.push([escapeCsv("Internal Quality Assurance Cell (IQAC)")]);
    csvRows.push([escapeCsv("Performance & Excellence Scorecard (PES) Report")]);
    csvRows.push([]);
    csvRows.push([
      escapeCsv('Department'),
      escapeCsv('Res. Publications (Prev)'),
      escapeCsv('Res. Publications (Target)'),
      escapeCsv('Books Published (Prev)'),
      escapeCsv('Books Published (Target)'),
      escapeCsv('Res. Projects (Prev)'),
      escapeCsv('Res. Projects (Target)'),
      escapeCsv('MoUs Signed (Prev)'),
      escapeCsv('MoUs Signed (Target)')
    ]);
    
    let totals = { pubP: 0, pubT: 0, bkP: 0, bkT: 0, prP: 0, prT: 0, moP: 0, moT: 0 };
    list.forEach(p => {
      const data = p.data || {};
      const pubP = data.parameters && data.parameters.param_1 ? data.parameters.param_1.prev : 0;
      const pubT = data.parameters && data.parameters.param_1 ? data.parameters.param_1.target : 0;
      const bkP = data.parameters && data.parameters.param_2 ? data.parameters.param_2.prev : 0;
      const bkT = data.parameters && data.parameters.param_2 ? data.parameters.param_2.target : 0;
      const prP = data.parameters && data.parameters.param_6a ? (data.parameters.param_6a.prev + (data.parameters.param_6b ? data.parameters.param_6b.prev : 0)) : 0;
      const prT = data.parameters && data.parameters.param_6a ? (data.parameters.param_6a.target + (data.parameters.param_6b ? data.parameters.param_6b.target : 0)) : 0;
      const moP = data.collaboration && data.collaboration.param_1 ? data.collaboration.param_1.prev : 0;
      const moT = data.collaboration && data.collaboration.param_1 ? data.collaboration.param_1.target : 0;
      
      totals.pubP += pubP; totals.pubT += pubT;
      totals.bkP += bkP; totals.bkT += bkT;
      totals.prP += prP; totals.prT += prT;
      totals.moP += moP; totals.moT += moT;
      
      csvRows.push([
        escapeCsv(p.department),
        pubP, pubT,
        bkP, bkT,
        prP, prT,
        moP, moT
      ]);
    });
    
    csvRows.push([
      escapeCsv('Total of Filtered Data'),
      totals.pubP, totals.pubT,
      totals.bkP, totals.bkT,
      totals.prP, totals.prT,
      totals.moP, totals.moT
    ]);
    
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    downloadCSV(csvContent, filename);
  } catch (err) {
    console.error("Failed to export PES Excel:", err);
    alert(err.message || "Failed to export Excel");
  }
}

function exportSinglePesExcel() {
  const pes = state.pesSubmissions.find(p => p.id == state.activeViewPesId);
  if (!pes) return;
  
  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '';
    const stringified = String(str).replace(/"/g, '""');
    if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
      return `"${stringified}"`;
    }
    return stringified;
  };
  
  const data = pes.data || {};
  let csvContent = "";
  csvContent += "St. Joseph's College (Autonomous), Tiruchirappalli - 620 002\r\n";
  csvContent += "Internal Quality Assurance Cell (IQAC)\r\n";
  csvContent += "Department Performance and Excellence Scorecard\r\n";
  csvContent += `Department: ${pes.department}\r\n\r\n`;
  
  csvContent += "SECTION 1: RESEARCH, TEACHING EXCELLENCE, AND INNOVATION\r\n";
  csvContent += "Major Research Areas of the Department:\r\n";
  (data.major_research_areas || []).forEach((area, index) => {
    csvContent += `${String.fromCharCode(97 + index)}. ${escapeCsv(area)}\r\n`;
  });
  csvContent += "\r\n";
  
  csvContent += "S. No.,Research Parameter,Previous Year (2025-26),Target for 2026-27\r\n";
  const params = data.parameters || {};
  const paramNames = [
    "Research Publications",
    "Books Published",
    "Book Chapters Published",
    "Conference Proceedings",
    "Average Departmental H-index",
    "Research Projects (Submitted)",
    "Research Projects (Sanctioned)",
    "Patent Applications Submitted",
    "Patents Granted",
    "Copyrights Filed",
    "Product Development Projects",
    "Prototypes Developed",
    "Start-ups Incubated",
    "Technology Transfer Initiatives"
  ];
  
  paramNames.forEach((name, idx) => {
    const sNo = idx + 1;
    let prev = 0, target = 0;
    if (sNo === 6) {
      prev = params.param_6a ? params.param_6a.prev : 0;
      target = params.param_6a ? params.param_6a.target : 0;
    } else if (sNo === 7) {
      prev = params.param_6b ? params.param_6b.prev : 0;
      target = params.param_6b ? params.param_6b.target : 0;
    } else {
      const key = `param_${sNo > 7 ? sNo - 1 : sNo}`;
      prev = params[key] ? params[key].prev : 0;
      target = params[key] ? params[key].target : 0;
    }
    csvContent += `${sNo},${escapeCsv(name)},${prev},${target}\r\n`;
  });
  csvContent += "\r\n";
  
  csvContent += "SECTION 2: TEACHING-LEARNING PEDAGOGY (TLP)\r\n";
  csvContent += "Faculty Name,TLPs Planned (Odd),TLPs Planned (Even),Innovative Assessments (Odd),Innovative Assessments (Even),E-Content (4 Quadrant)\r\n";
  (data.faculty_compliance || []).forEach(f => {
    csvContent += `${escapeCsv(f.name)},${f.tlp_odd},${f.tlp_even},${f.assess_odd},${f.assess_even},${f.econtent}\r\n`;
  });
  csvContent += "\r\n";
  
  csvContent += "S.No,Teaching-Learning Practice,Number Planned\r\n";
  const targets = data.innovation_targets || {};
  const tNames = [
    "Flipped Classroom Sessions",
    "Project-Based Learning Activities",
    "Problem-Based Learning Activities",
    "Experiential Learning Activities",
    "ICT-Enabled Teaching Sessions",
    "AI-Assisted Learning Activities",
    "Peer Learning Activities",
    "Case Study-Based Teaching",
    "Field-Based Learning Activities"
  ];
  tNames.forEach((name, idx) => {
    csvContent += `${idx + 1},${escapeCsv(name)},${targets[`target_${idx + 1}`] || 0}\r\n`;
  });
  
  const otherTargets = targets.other_targets || [];
  otherTargets.forEach((t, idx) => {
    csvContent += `${idx + 10},Any other: ${escapeCsv(t.spec)},${t.count}\r\n`;
  });
  csvContent += "\r\n";
  
  csvContent += "SECTION 3: PLACEMENT AND CAREER DEVELOPMENT\r\n";
  csvContent += "S.No,Placement Parameter,Previous Year,Target for 2026-27\r\n";
  const place = data.placement || {};
  const pNames = [
    "MoUs created for Placements / Projects / Internships",
    "Placement Training Programmes",
    "Industry Interaction / Training Sessions"
  ];
  pNames.forEach((name, idx) => {
    const key = `param_${idx + 1}`;
    csvContent += `${idx + 1},${escapeCsv(name)},${place[key] ? place[key].prev : 0},${place[key] ? place[key].target : 0}\r\n`;
  });
  csvContent += "Plans to Improve Placement:\r\n";
  (data.placement_plans || []).forEach((p, idx) => {
    csvContent += `${String.fromCharCode(97 + idx)}. ${escapeCsv(p)}\r\n`;
  });
  csvContent += "\r\n";
  
  csvContent += "SECTION 4: INDUSTRY-ACADEMIA COLLABORATION\r\n";
  csvContent += "S.No,Parameter,Previous Year,Target for 2026-27\r\n";
  const collab = data.collaboration || {};
  const cNames = [
    "MoUs Signed",
    "Active MoUs",
    "Industry Experts Invited",
    "Industrial Visits Conducted",
    "Industry - Sponsored Research Projects",
    "Consultancy Assignments",
    "Joint Publications with Industry"
  ];
  cNames.forEach((name, idx) => {
    const key = `param_${idx + 1}`;
    csvContent += `${idx + 1},${escapeCsv(name)},${collab[key] ? collab[key].prev : 0},${collab[key] ? collab[key].target : 0}\r\n`;
  });
  csvContent += "Plans for Industry Collaboration:\r\n";
  (data.collaboration_plans || []).forEach((c, idx) => {
    csvContent += `${String.fromCharCode(97 + idx)}. ${escapeCsv(c)}\r\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `pes_scorecard_${pes.department.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------- PES SCORECARD VIEW & DELETE ACTIONS ----------------

function viewPesScorecardDetails(id) {
  const pes = state.pesSubmissions.find(p => p.id == id);
  if (!pes) return;
  
  state.activeViewPesId = id;
  
  // Populate detailed viewer fields
  document.getElementById('view-pes-academic-year').innerText = pes.academic_year || '2026-2027';
  document.getElementById('view-pes-department').innerText = (pes.department || '').toUpperCase();
  
  const data = pes.data || {};
  
  // 1. Research Areas
  const researchList = document.getElementById('view-pes-research-areas');
  const areas = data.major_research_areas || [];
  researchList.innerHTML = areas.map(area => `<li>${escapeHtml(area)}</li>`).join('') || '<li>None specified</li>';
  
  // 2. Parameters (13 Research parameters)
  const paramNames = [
    "Research Publications",
    "Books Published",
    "Book Chapters Published",
    "Conference Proceedings",
    "Average Departmental H-index",
    "Research Projects: (a) Submitted (b) Sanctioned",
    "Patent Applications Submitted",
    "Patents Granted",
    "Copyrights Filed",
    "Product Development Projects",
    "Prototypes Developed",
    "Start-ups Incubated",
    "Technology Transfer Initiatives"
  ];
  
  const paramsTbody = document.getElementById('view-pes-params-tbody');
  paramsTbody.innerHTML = '';
  const params = data.parameters || {};
  
  paramNames.forEach((name, idx) => {
    const sNo = idx + 1;
    let prevVal = 0;
    let targetVal = 0;
    
    if (sNo === 6) {
      // Research Projects submitted and sanctioned
      const prevSub = params.param_6a ? params.param_6a.prev || 0 : 0;
      const prevSanc = params.param_6b ? params.param_6b.prev || 0 : 0;
      const targetSub = params.param_6a ? params.param_6a.target || 0 : 0;
      const targetSanc = params.param_6b ? params.param_6b.target || 0 : 0;
      
      const tr = document.createElement('tr');
      tr.style.border = '1px solid #000';
      tr.innerHTML = `
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">6</td>
        <td style="padding: 6px; border: 1px solid #000; font-weight: bold;">Research Projects:<br>&nbsp;&nbsp;(a) Submitted<br>&nbsp;&nbsp;(b) Sanctioned</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">
          Submitted: ${prevSub}<br>Sanctioned: ${prevSanc}
        </td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">
          Submitted: ${targetSub}<br>Sanctioned: ${targetSanc}
        </td>
      `;
      paramsTbody.appendChild(tr);
    } else {
      const key = `param_${sNo}`;
      prevVal = params[key] ? params[key].prev || 0 : 0;
      targetVal = params[key] ? params[key].target || 0 : 0;
      
      const tr = document.createElement('tr');
      tr.style.border = '1px solid #000';
      tr.innerHTML = `
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">${sNo}</td>
        <td style="padding: 6px; border: 1px solid #000;">${name}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">${prevVal}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center;">${targetVal}</td>
      `;
      paramsTbody.appendChild(tr);
    }
  });
  
  // 3. Faculty Compliance Rows
  const facultyTbody = document.getElementById('view-pes-faculty-tbody');
  facultyTbody.innerHTML = '';
  const facultyList = data.faculty_compliance || [];
  facultyList.forEach((fac, idx) => {
    const tr = document.createElement('tr');
    tr.style.border = '1px solid #000';
    tr.innerHTML = `
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: left;">${escapeHtml(fac.name)}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${fac.tlp_odd}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${fac.tlp_even}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${fac.assess_odd}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${fac.assess_even}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${fac.econtent}</td>
    `;
    facultyTbody.appendChild(tr);
  });
  if (facultyList.length === 0) {
    facultyTbody.innerHTML = `<tr><td colspan="7" style="padding: 10px; border: 1px solid #000;">No faculty compliance plans registered.</td></tr>`;
  }
  
  // 4. Teaching Innovation Targets
  const targetsTbody = document.getElementById('view-pes-targets-tbody');
  targetsTbody.innerHTML = '';
  const targetsListLeft = [
    { label: "Flipped Classroom Sessions", key: "target_1", sNo: 1 },
    { label: "Project-Based Learning Activities", key: "target_2", sNo: 2 },
    { label: "Problem-Based Learning Activities", key: "target_3", sNo: 3 },
    { label: "Experiential Learning Activities", key: "target_4", sNo: 4 },
    { label: "ICT-Enabled Teaching Sessions", key: "target_5", sNo: 5 }
  ];
  const targetsListRight = [
    { label: "AI-Assisted Learning Activities", key: "target_6", sNo: 6 },
    { label: "Peer Learning Activities", key: "target_7", sNo: 7 },
    { label: "Case Study-Based Teaching", key: "target_8", sNo: 8 },
    { label: "Field-Based Learning Activities", key: "target_9", sNo: 9 }
  ];
  
  const targets = data.innovation_targets || {};
  const otherTargets = targets.other_targets || [];
  
  for (let i = 0; i < 5; i++) {
    const leftItem = targetsListLeft[i];
    const rightItem = targetsListRight[i];
    const leftVal = leftItem ? targets[leftItem.key] || 0 : '';
    let rightLabel = '';
    let rightVal = '';
    let rightSNo = '';
    
    if (rightItem) {
      rightLabel = rightItem.label;
      rightVal = targets[rightItem.key] || 0;
      rightSNo = rightItem.sNo;
    } else if (i === 4) {
      rightSNo = 10;
      if (otherTargets.length > 0) {
        rightLabel = `Any other: ${otherTargets.map(t => `${t.spec} (${t.count})`).join(', ')}`;
        rightVal = otherTargets.reduce((sum, t) => sum + t.count, 0);
      } else if (targets.target_10_spec) {
        rightLabel = `Any other: ${targets.target_10_spec}`;
        rightVal = targets.target_10 || 0;
      } else {
        rightLabel = "Any other - specify";
        rightVal = 0;
      }
    }
    
    const tr = document.createElement('tr');
    tr.style.border = '1px solid #000';
    tr.innerHTML = `
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${leftItem.sNo}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: left;">${leftItem.label}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold;">${leftVal}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${rightSNo}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: left;">${rightLabel}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold;">${rightVal}</td>
    `;
    targetsTbody.appendChild(tr);
  }
  
  // 5. Placement Parameters
  const placementTbody = document.getElementById('view-pes-placement-tbody');
  placementTbody.innerHTML = '';
  const placeNames = [
    "MoUs created for Placements / Projects / Internships",
    "Placement Training Programmes",
    "Industry Interaction / Training Sessions"
  ];
  const placement = data.placement || {};
  placeNames.forEach((name, idx) => {
    const sNo = idx + 1;
    const key = `param_${sNo}`;
    const prevVal = placement[key] ? placement[key].prev || 0 : 0;
    const targetVal = placement[key] ? placement[key].target || 0 : 0;
    
    const tr = document.createElement('tr');
    tr.style.border = '1px solid #000';
    tr.innerHTML = `
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${sNo}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: left;">${name}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${prevVal}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${targetVal}</td>
    `;
    placementTbody.appendChild(tr);
  });
  
  const placementPlansList = document.getElementById('view-pes-placement-plans');
  const placePlans = data.placement_plans || [];
  placementPlansList.innerHTML = placePlans.map(plan => `<li>${escapeHtml(plan)}</li>`).join('') || '<li>None specified</li>';
  
  // 6. Collaboration Parameters
  const collabTbody = document.getElementById('view-pes-collab-tbody');
  collabTbody.innerHTML = '';
  const collabNames = [
    "MoUs Signed",
    "Active MoUs",
    "Industry Experts Invited",
    "Industrial Visits Conducted",
    "Industry - Sponsored Research Projects",
    "Consultancy Assignments",
    "Joint Publications with Industry"
  ];
  const collaboration = data.collaboration || {};
  collabNames.forEach((name, idx) => {
    const sNo = idx + 1;
    const key = `param_${sNo}`;
    const prevVal = collaboration[key] ? collaboration[key].prev || 0 : 0;
    const targetVal = collaboration[key] ? collaboration[key].target || 0 : 0;
    
    const tr = document.createElement('tr');
    tr.style.border = '1px solid #000';
    tr.innerHTML = `
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${sNo}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: left;">${name}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${prevVal}</td>
      <td style="padding: 6px; border: 1px solid #000; text-align: center;">${targetVal}</td>
    `;
    collabTbody.appendChild(tr);
  });
  
  const collabPlansList = document.getElementById('view-pes-collab-plans');
  const collabPlans = data.collaboration_plans || [];
  collabPlansList.innerHTML = collabPlans.map(plan => `<li>${escapeHtml(plan)}</li>`).join('') || '<li>None specified</li>';
  
  const sigName = document.getElementById('view-pes-hod-signature');
  if (sigName) {
    sigName.innerText = data.hod_name || 'Coordinator';
  }
  
  document.getElementById('pes-view-modal').classList.add('open');
}

function closePesViewModal() {
  document.getElementById('pes-view-modal').classList.remove('open');
}

async function deletePesScorecard(id) {
  const confirmed = await showCustomConfirm(
    "Are you sure you want to delete this PES scorecard? This action cannot be undone.",
    "Delete Scorecard",
    "danger",
    "Yes, Delete",
    "Cancel"
  );
  if (!confirmed) return;
  
  try {
    await fetchAPI(`/pes/${id}`, { method: 'DELETE' });
    alert("PES scorecard deleted successfully!");
    await loadPesSubmissions();
    if (state.currentUser.role === 'Staff') {
      renderStaffPesPage();
    } else {
      renderUserPesPage();
    }
  } catch (err) {
    console.error("Failed to delete scorecard:", err);
    alert(err.message || "Failed to delete scorecard");
  }
}


