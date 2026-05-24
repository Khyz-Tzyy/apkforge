/* ==========================================
   APKFORGE - Admin Logic
   A Khyz Project
   ========================================== */

/* ── Mock Data ── */
const mockUsers = [
  { id: '1', name: 'huda_dev', email: 'huda@example.com', role: 'admin', builds: 12, projects: 4, joined: Date.now() - 86400000 * 30, status: 'active' },
  { id: '2', name: 'flutter_user', email: 'user1@example.com', role: 'user', builds: 5, projects: 2, joined: Date.now() - 86400000 * 7, status: 'active' },
  { id: '3', name: 'test_account', email: 'test@example.com', role: 'user', builds: 1, projects: 1, joined: Date.now() - 86400000 * 2, status: 'active' },
  { id: '4', name: 'banned_user', email: 'bad@example.com', role: 'user', builds: 0, projects: 0, joined: Date.now() - 86400000 * 14, status: 'banned' },
];

const mockBuilds = [
  { id: 'b1', project: 'my_flutter_app', user: 'huda_dev', flutter: '3.24', status: 'success', duration: '3m 24s', apkSize: '12.4 MB', time: Date.now() - 3600000 * 2 },
  { id: 'b2', project: 'test_project', user: 'flutter_user', flutter: '3.22', status: 'failed', duration: '1m 12s', apkSize: null, time: Date.now() - 3600000 * 5 },
  { id: 'b3', project: 'cool_app', user: 'test_account', flutter: '3.24', status: 'success', duration: '4m 01s', apkSize: '9.8 MB', time: Date.now() - 86400000 },
  { id: 'b4', project: 'my_flutter_app', user: 'huda_dev', flutter: '3.24', status: 'success', duration: '3m 10s', apkSize: '12.1 MB', time: Date.now() - 86400000 * 2 },
  { id: 'b5', project: 'another_app', user: 'flutter_user', flutter: '3.19', status: 'failed', duration: '0m 45s', apkSize: null, time: Date.now() - 86400000 * 3 },
];

const mockActivity = [
  { type: 'build', text: '<strong>huda_dev</strong> started a new build for <strong>my_flutter_app</strong>', time: '2 min ago' },
  { type: 'user', text: '<strong>test_account</strong> registered a new account', time: '1 hour ago' },
  { type: 'download', text: '<strong>huda_dev</strong> downloaded <strong>my_flutter_app-release.apk</strong>', time: '2 hours ago' },
  { type: 'build', text: '<strong>flutter_user</strong> build failed for <strong>test_project</strong>', time: '5 hours ago' },
  { type: 'error', text: 'Build timeout detected on <strong>another_app</strong>', time: '1 day ago' },
];

/* ── Render Admin Overview Stats ── */
function renderOverviewStats() {
  const successBuilds = mockBuilds.filter(b => b.status === 'success').length;
  const failedBuilds = mockBuilds.filter(b => b.status === 'failed').length;
  const totalDownloads = mockBuilds.filter(b => b.status === 'success').length;
  const successRate = mockBuilds.length > 0
    ? Math.round((successBuilds / mockBuilds.length) * 100)
    : 0;

  setEl('stat-users', mockUsers.length);
  setEl('stat-builds-today', mockBuilds.filter(b => Date.now() - b.time < 86400000).length);
  setEl('stat-builds-total', mockBuilds.length);
  setEl('stat-success-rate', successRate + '%');
  setEl('stat-downloads', totalDownloads);
  setEl('stat-failed', failedBuilds);
  setEl('stat-storage', (successBuilds * 11.2).toFixed(1) + ' MB');

  setEl('nav-user-count', mockUsers.length);
  setEl('nav-build-count', mockBuilds.length);
}

/* ── Render Activity Feed ── */
function renderActivityFeed() {
  const list = document.getElementById('activity-list');
  if (!list) return;

  list.innerHTML = mockActivity.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${a.type}">
        ${a.type === 'build' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>` : ''}
        ${a.type === 'user' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` : ''}
        ${a.type === 'download' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>` : ''}
        ${a.type === 'error' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>` : ''}
      </div>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

/* ── Render Recent Users (overview) ── */
function renderRecentUsers() {
  const tbody = document.getElementById('recent-users-body');
  if (!tbody) return;

  tbody.innerHTML = mockUsers.slice(0, 4).map(u => `
    <tr>
      <td>
        <div class="user-row-info">
          <div class="user-row-avatar">${u.name[0].toUpperCase()}</div>
          <div>
            <div class="user-row-name">${u.name}</div>
            <div class="user-row-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>${new Date(u.joined).toLocaleDateString()}</td>
      <td>${u.builds}</td>
      <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
    </tr>
  `).join('');
}

/* ── Render Recent Builds (overview) ── */
function renderRecentBuilds() {
  const tbody = document.getElementById('recent-builds-body');
  if (!tbody) return;

  tbody.innerHTML = mockBuilds.slice(0, 5).map(b => `
    <tr>
      <td>
        <div class="build-row-name">${b.project}</div>
      </td>
      <td class="td-muted">${b.user}</td>
      <td><span class="badge badge-muted" style="font-size:0.68rem">Flutter ${b.flutter}</span></td>
      <td><span class="badge ${b.status === 'success' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
      <td class="td-muted td-mono">${b.duration}</td>
      <td class="td-mono">${new Date(b.time).toLocaleString()}</td>
      <td>
        <div class="row-actions">
          ${b.status === 'success' ? `<button class="btn btn-ghost btn-sm" onclick="showToast('Download: ${b.project}.apk')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>
          </button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="showToast('Build log coming with backend!')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Render Users Table (users.html) ── */
function renderUsersTable(list) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  const countBadge = document.getElementById('user-count-badge');
  if (countBadge) countBadge.textContent = list.length + ' users';

  tbody.innerHTML = list.map(u => `
    <tr>
      <td>
        <div class="user-row-info">
          <div class="user-row-avatar">${u.name[0].toUpperCase()}</div>
          <div>
            <div class="user-row-name">${u.name}</div>
            <div class="user-row-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${u.role === 'admin' ? 'badge-warning' : 'badge-muted'}">${u.role}</span>
      </td>
      <td class="td-mono">${u.builds} / 7</td>
      <td class="td-muted">${u.projects}</td>
      <td class="td-muted">${new Date(u.joined).toLocaleDateString()}</td>
      <td>
        <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status}</span>
      </td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="showToast('Reset limit for ${u.name}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            Reset
          </button>
          <button class="btn ${u.status === 'active' ? 'btn-danger' : 'btn-secondary'} btn-sm" onclick="showToast('${u.status === 'active' ? 'Banned' : 'Unbanned'}: ${u.name}')">
            ${u.status === 'active' ? 'Ban' : 'Unban'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Render Builds Table (builds.html) ── */
function renderBuildsTable(list) {
  const tbody = document.getElementById('builds-table-body');
  if (!tbody) return;

  tbody.innerHTML = list.map(b => `
    <tr>
      <td>
        <div class="build-row-name">${b.project}</div>
      </td>
      <td class="td-muted">${b.user}</td>
      <td><span class="badge badge-muted" style="font-size:0.68rem">Flutter ${b.flutter}</span></td>
      <td><span class="badge ${b.status === 'success' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
      <td class="td-mono td-muted">${b.duration}</td>
      <td class="td-mono">${b.apkSize || '—'}</td>
      <td class="td-muted">${new Date(b.time).toLocaleString()}</td>
      <td>
        <div class="row-actions">
          ${b.status === 'success' ? `
            <button class="btn btn-ghost btn-sm" onclick="showToast('Downloading ${b.project}.apk')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>
            </button>
          ` : ''}
          <button class="btn btn-ghost btn-sm" onclick="showToast('Log viewer coming soon!')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </button>
          <button class="btn btn-danger btn-sm" onclick="showToast('Build ${b.id} deleted!')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Helpers ── */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function refreshStatus() {
  showToast('System status refreshed! (mock)');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 2500);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function checkMobile() {
  const btn = document.getElementById('sidebar-toggle');
  if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
}

/* ── Init ── */
window.addEventListener('resize', checkMobile);
checkMobile();

document.addEventListener('DOMContentLoaded', () => {
  renderOverviewStats();
  renderActivityFeed();
  renderRecentUsers();
  renderRecentBuilds();
});
