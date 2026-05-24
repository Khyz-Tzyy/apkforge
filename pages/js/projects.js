/* ==========================================
   APKFORGE - Projects Logic
   ========================================== */

/* ── Mock Data ── */
let projects = [
  {
    id: '1',
    name: 'my_flutter_app',
    package: 'com.example.myapp',
    desc: 'Starter Flutter project',
    version: '1.0.0',
    createdAt: Date.now() - 86400000 * 2,
    lastBuild: Date.now() - 3600000 * 2,
    buildHistory: ['success', 'success', 'failed'],
    lastStatus: 'success',
    downloads: 1,
    apkSize: '12.4 MB',
  },
  {
    id: '2',
    name: 'test_project',
    package: 'com.khyz.test',
    desc: 'Testing new UI components',
    version: '0.1.0',
    createdAt: Date.now() - 86400000,
    lastBuild: Date.now() - 86400000,
    buildHistory: ['failed'],
    lastStatus: 'failed',
    downloads: 0,
    apkSize: null,
  },
];

let currentView = 'grid';
let contextProjectId = null;

/* ── Render ── */
function renderProjects(list) {
  const container = document.getElementById('projects-container');

  if (list.length === 0) {
    container.innerHTML = `
      <div class="projects-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        <div class="projects-empty-title">No projects found</div>
        <div class="projects-empty-desc">Create your first Flutter project and start building APKs from your browser.</div>
        <button class="btn btn-primary" onclick="showNewProjectModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create First Project
        </button>
      </div>
    `;
    return;
  }

  if (currentView === 'grid') {
    container.innerHTML = `<div class="projects-grid">${list.map(renderGridCard).join('')}</div>`;
  } else {
    container.innerHTML = `<div class="projects-list-view">${list.map(renderListItem).join('')}</div>`;
  }
}

function renderGridCard(p) {
  const initials = p.name.substring(0, 2).toUpperCase();
  const date = new Date(p.lastBuild || p.createdAt).toLocaleDateString();
  const dots = p.buildHistory.slice(-5).map(s =>
    `<div class="build-dot ${s}" title="${s}"></div>`
  ).join('');

  return `
    <div class="project-card" onclick="openProject('${p.id}')" oncontextmenu="showProjectMenu(event,'${p.id}')">
      <div class="project-card-header">
        <div class="project-icon">${initials}</div>
        <button class="project-menu-btn" onclick="event.stopPropagation();showProjectMenu(event,'${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
      <div class="project-name">${p.name}</div>
      <div class="project-package">${p.package}</div>
      <div class="project-meta">
        <div class="project-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          ${date}
        </div>
        <div class="project-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          v${p.version}
        </div>
        ${p.apkSize ? `<div class="project-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>${p.apkSize}</div>` : ''}
      </div>
      <div class="build-history-wrap">${dots}</div>
      <div class="project-card-footer">
        <span class="badge ${p.lastStatus === 'success' ? 'badge-success' : p.lastStatus === 'failed' ? 'badge-danger' : 'badge-muted'}">
          ${p.lastStatus === 'success' ? 'Built' : p.lastStatus === 'failed' ? 'Failed' : 'No Build'}
        </span>
        <div class="project-card-actions">
          ${p.lastStatus === 'success' ? `
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();downloadApk('${p.id}')" title="Download APK">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>
            </button>
          ` : ''}
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openProject('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>
            Open
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderListItem(p) {
  const initials = p.name.substring(0, 2).toUpperCase();
  const date = new Date(p.lastBuild || p.createdAt).toLocaleDateString();

  return `
    <div class="project-list-item" onclick="openProject('${p.id}')" oncontextmenu="showProjectMenu(event,'${p.id}')">
      <div class="project-list-icon">${initials}</div>
      <div class="project-list-info">
        <div class="project-list-name">${p.name}</div>
        <div class="project-list-meta">
          <span>${p.package}</span>
          <span>v${p.version}</span>
          <span>${date}</span>
          ${p.apkSize ? `<span>${p.apkSize}</span>` : ''}
        </div>
      </div>
      <div class="project-list-actions">
        <span class="badge ${p.lastStatus === 'success' ? 'badge-success' : p.lastStatus === 'failed' ? 'badge-danger' : 'badge-muted'}">
          ${p.lastStatus === 'success' ? 'Built' : p.lastStatus === 'failed' ? 'Failed' : 'No Build'}
        </span>
        ${p.lastStatus === 'success' ? `
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();downloadApk('${p.id}')" title="Download">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/></svg>
          </button>
        ` : ''}
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openProject('${p.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>
          Open
        </button>
      </div>
    </div>
  `;
}

/* ── Stats ── */
function updateStats() {
  document.getElementById('stat-total').textContent = projects.length;
  document.getElementById('stat-success').textContent = projects.filter(p => p.lastStatus === 'success').length;
  document.getElementById('stat-downloads').textContent = projects.reduce((a, p) => a + p.downloads, 0);
  const mb = projects.reduce((a, p) => {
    if (!p.apkSize) return a;
    return a + parseFloat(p.apkSize);
  }, 0);
  document.getElementById('stat-storage').textContent = mb.toFixed(1) + ' MB';
}

/* ── Filter / Search ── */
function filterProjects() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const status = document.getElementById('filter-status').value;
  const sort = document.getElementById('filter-sort').value;

  let list = [...projects];

  if (q) list = list.filter(p =>
    p.name.toLowerCase().includes(q) || p.package.toLowerCase().includes(q)
  );

  if (status !== 'all') list = list.filter(p => p.lastStatus === status);

  if (sort === 'newest') list.sort((a, b) => b.createdAt - a.createdAt);
  else if (sort === 'oldest') list.sort((a, b) => a.createdAt - b.createdAt);
  else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

  renderProjects(list);
}

/* ── View Toggle ── */
function setView(view) {
  currentView = view;
  document.getElementById('view-grid').classList.toggle('active', view === 'grid');
  document.getElementById('view-list').classList.toggle('active', view === 'list');
  filterProjects();
}

/* ── Actions ── */
function openProject(id) {
  window.location.href = `editor.html?project=${id}`;
}

function downloadApk(id) {
  showToast('Download will work when backend is connected!');
}

function showNewProjectModal() {
  document.getElementById('np-name').value = '';
  document.getElementById('np-package').value = '';
  document.getElementById('np-desc').value = '';
  document.getElementById('modal-new-project').classList.add('visible');
  setTimeout(() => document.getElementById('np-name').focus(), 100);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('visible');
}

function createProject() {
  const name = document.getElementById('np-name').value.trim().replace(/\s+/g, '_').toLowerCase();
  const pkg = document.getElementById('np-package').value.trim() || `com.example.${name}`;
  const desc = document.getElementById('np-desc').value.trim();

  if (!name) { showToast('Project name is required!'); return; }

  const newProject = {
    id: Date.now().toString(),
    name,
    package: pkg,
    desc,
    version: '1.0.0',
    createdAt: Date.now(),
    lastBuild: null,
    buildHistory: [],
    lastStatus: 'none',
    downloads: 0,
    apkSize: null,
  };

  projects.unshift(newProject);
  closeModal('modal-new-project');
  filterProjects();
  updateStats();
  showToast(`Project "${name}" created!`);

  setTimeout(() => openProject(newProject.id), 800);
}

/* ── Context Menu ── */
function showProjectMenu(e, id) {
  e.preventDefault();
  contextProjectId = id;
  const menu = document.getElementById('project-context-menu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('visible');
}

document.addEventListener('click', () => {
  document.getElementById('project-context-menu').classList.remove('visible');
});

function ctxOpenEditor() { if (contextProjectId) openProject(contextProjectId); }

function ctxBuild() { showToast('Build will work when backend is connected!'); }

function ctxDownload() {
  const p = projects.find(x => x.id === contextProjectId);
  if (!p || p.lastStatus !== 'success') { showToast('No APK available for this project.'); return; }
  downloadApk(contextProjectId);
}

function ctxRename() {
  const p = projects.find(x => x.id === contextProjectId);
  if (!p) return;
  const name = prompt('New project name:', p.name);
  if (name && name.trim()) {
    p.name = name.trim().replace(/\s+/g, '_').toLowerCase();
    filterProjects();
    showToast('Project renamed!');
  }
}

function ctxDelete() {
  const p = projects.find(x => x.id === contextProjectId);
  if (!p) return;
  if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
    projects = projects.filter(x => x.id !== contextProjectId);
    filterProjects();
    updateStats();
    showToast('Project deleted.');
  }
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 2500);
}

/* ── Sidebar ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function checkMobile() {
  const isMobile = window.innerWidth <= 768;
  document.getElementById('sidebar-toggle').style.display = isMobile ? 'flex' : 'none';
}

/* ── Init ── */
const username = localStorage.getItem('apkforge_username') || 'User';
document.getElementById('user-name').textContent = username;
document.getElementById('user-avatar').textContent = username[0].toUpperCase();

window.addEventListener('resize', checkMobile);
checkMobile();
updateStats();
filterProjects();
