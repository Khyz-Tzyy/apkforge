/* ==========================================
   APKFORGE - Editor Logic
   ========================================== */

/* ── State ── */
const EditorState = {
  files: {
    // Files akan di-load dari project user via Supabase nanti
  },
  openTabs: [],
  activeTab: null,
  contextTarget: null,
  buildRunning: false,
};

/* ── File Icons ── */
function getFileIcon(name) {
  const ext = name.split('.').pop();
  const icons = {
    dart: `<svg class="tree-dart" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,
    yaml: `<svg class="tree-yaml" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`,
    json: `<svg class="tree-json" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`,
    md: `<svg class="tree-md" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`,
  };
  return icons[ext] || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`;
}

function getFolderIcon() {
  return `<svg class="tree-folder" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`;
}

/* ── Build File Tree ── */
function buildFileTree() {
  const tree = {};
  Object.keys(EditorState.files).forEach(path => {
    const parts = path.split('/');
    let node = tree;
    parts.forEach((part, i) => {
      if (i < parts.length - 1) {
        node[part] = node[part] || { __type: 'folder', __children: {} };
        node = node[part].__children;
      } else {
        node[part] = { __type: 'file', __path: path };
      }
    });
  });
  return tree;
}

function renderTree(node, container, depth = 0) {
  const folders = [];
  const files = [];

  Object.entries(node).forEach(([name, val]) => {
    if (val.__type === 'folder') folders.push([name, val]);
    else files.push([name, val]);
  });

  folders.sort((a, b) => a[0].localeCompare(b[0]));
  files.sort((a, b) => a[0].localeCompare(b[0]));

  [...folders, ...files].forEach(([name, val]) => {
    if (val.__type === 'folder') {
      const wrapper = document.createElement('div');

      const item = document.createElement('div');
      item.className = 'tree-item';
      item.style.paddingLeft = `${10 + depth * 12}px`;
      item.innerHTML = `
        <svg class="tree-folder-toggle open" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
        ${getFolderIcon()}
        <span class="tree-item-name">${name}</span>
      `;

      const children = document.createElement('div');
      children.className = 'tree-children';
      renderTree(val.__children, children, depth + 1);

      item.addEventListener('click', () => {
        const toggle = item.querySelector('.tree-folder-toggle');
        toggle.classList.toggle('open');
        children.classList.toggle('hidden');
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, name);
      });

      wrapper.appendChild(item);
      wrapper.appendChild(children);
      container.appendChild(wrapper);
    } else {
      const item = document.createElement('div');
      item.className = 'tree-item' + (val.__path === EditorState.activeTab ? ' active' : '');
      item.dataset.path = val.__path;
      item.style.paddingLeft = `${10 + depth * 12}px`;
      item.innerHTML = `
        ${getFileIcon(name)}
        <span class="tree-item-name">${name}</span>
        <div class="tree-item-actions">
          <button class="icon-btn" title="Rename" onclick="event.stopPropagation(); showRenameModal('${val.__path}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      `;

      item.addEventListener('click', () => openFile(val.__path));
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, val.__path);
      });

      container.appendChild(item);
    }
  });
}

function refreshTree() {
  const container = document.getElementById('filetree');
  container.innerHTML = '';
  const tree = buildFileTree();
  renderTree(tree, container);
}

/* ── Tabs ── */
function refreshTabs() {
  const tabsEl = document.getElementById('editor-tabs');
  if (EditorState.openTabs.length === 0) {
    tabsEl.innerHTML = `<div style="padding:0 10px;display:flex;align-items:center;color:var(--text-muted);font-size:0.75rem">No file open</div>`;
    return;
  }

  tabsEl.innerHTML = EditorState.openTabs.map(path => {
    const name = path.split('/').pop();
    const active = path === EditorState.activeTab;
    return `
      <div class="editor-tab ${active ? 'active' : ''}" onclick="openFile('${path}')">
        ${getFileIcon(name)}
        ${name}
        <button class="editor-tab-close" onclick="event.stopPropagation(); closeTab('${path}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

/* ── Open / Close File ── */
function openFile(path) {
  if (!EditorState.files[path] && EditorState.files[path] !== '') return;
  if (!EditorState.openTabs.includes(path)) {
    EditorState.openTabs.push(path);
  }
  EditorState.activeTab = path;

  const editor = document.getElementById('code-editor');
  editor.value = EditorState.files[path];

  const ext = path.split('.').pop();
  const langMap = { dart: 'Dart', yaml: 'YAML', json: 'JSON', md: 'Markdown', js: 'JavaScript' };
  document.getElementById('status-lang').textContent = langMap[ext] || ext.toUpperCase();

  refreshTabs();
  refreshTree();
  updateLineNumbers();
}

function closeTab(path) {
  EditorState.openTabs = EditorState.openTabs.filter(t => t !== path);
  if (EditorState.activeTab === path) {
    EditorState.activeTab = EditorState.openTabs[EditorState.openTabs.length - 1] || null;
    if (EditorState.activeTab) {
      openFile(EditorState.activeTab);
    } else {
      document.getElementById('code-editor').value = '';
      updateLineNumbers();
    }
  }
  refreshTabs();
}

/* ── Line Numbers ── */
function updateLineNumbers() {
  const editor = document.getElementById('code-editor');
  const lines = editor.value.split('\n').length;
  const ln = document.getElementById('line-numbers');
  ln.innerHTML = Array.from({ length: lines }, (_, i) =>
    `<span>${i + 1}</span>`
  ).join('');
}

/* ── Cursor Position ── */
function updateCursor() {
  const editor = document.getElementById('code-editor');
  const val = editor.value.substring(0, editor.selectionStart);
  const lines = val.split('\n');
  const ln = lines.length;
  const col = lines[lines.length - 1].length + 1;
  document.getElementById('status-cursor').textContent = `Ln ${ln}, Col ${col}`;
}

/* ── Save ── */
let saveTimeout;
function autoSave() {
  const editor = document.getElementById('code-editor');
  if (EditorState.activeTab) {
    EditorState.files[EditorState.activeTab] = editor.value;
  }
  document.getElementById('save-status').textContent = 'Saving...';
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    document.getElementById('save-status').textContent = 'All changes saved';
  }, 800);
  updateLineNumbers();
  updateCursor();
}

/* ── Tab Key ── */
document.getElementById('code-editor').addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const editor = e.target;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    autoSave();
  }
});

document.getElementById('code-editor').addEventListener('input', autoSave);
document.getElementById('code-editor').addEventListener('click', updateCursor);
document.getElementById('code-editor').addEventListener('keyup', updateCursor);

/* ── Right Panel Tabs ── */
function switchRightTab(tab, btn) {
  document.querySelectorAll('.right-panel-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.right-panel-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
}

function togglePanel(tab) {
  const panel = document.getElementById('right-panel');
  const tabBtn = [...document.querySelectorAll('.right-panel-tab')].find(b => b.textContent.trim().toLowerCase().startsWith(tab));
  const content = document.getElementById('tab-' + tab);
  const isActive = content.classList.contains('active');
  if (isActive) {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  } else {
    panel.style.display = 'flex';
    if (tabBtn) switchRightTab(tab, tabBtn);
  }
}

/* ── Context Menu ── */
function showContextMenu(e, path) {
  EditorState.contextTarget = path;
  const menu = document.getElementById('context-menu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('visible');
}

function hideContextMenu() {
  document.getElementById('context-menu').classList.remove('visible');
}

document.addEventListener('click', hideContextMenu);

function ctxRename() {
  showRenameModal(EditorState.contextTarget);
}

function ctxNewFile() {
  showNewFileModal();
}

function ctxDelete() {
  if (!EditorState.contextTarget) return;
  if (confirm(`Delete "${EditorState.contextTarget}"?`)) {
    delete EditorState.files[EditorState.contextTarget];
    closeTab(EditorState.contextTarget);
    refreshTree();
  }
}

/* ── Modals ── */
function showNewFileModal() {
  document.getElementById('modal-newfile-input').value = '';
  document.getElementById('modal-newfile').classList.add('visible');
  setTimeout(() => document.getElementById('modal-newfile-input').focus(), 100);
}

function showNewFolderModal() {
  document.getElementById('modal-newfolder-input').value = '';
  document.getElementById('modal-newfolder').classList.add('visible');
  setTimeout(() => document.getElementById('modal-newfolder-input').focus(), 100);
}

function showRenameModal(path) {
  EditorState.contextTarget = path;
  const name = path.split('/').pop();
  document.getElementById('modal-rename-input').value = name;
  document.getElementById('modal-rename').classList.add('visible');
  setTimeout(() => document.getElementById('modal-rename-input').focus(), 100);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('visible');
}

function confirmNewFile() {
  const name = document.getElementById('modal-newfile-input').value.trim();
  if (!name) return;
  const path = 'lib/' + name;
  EditorState.files[path] = '';
  closeModal('modal-newfile');
  refreshTree();
  openFile(path);
}

function confirmNewFolder() {
  const name = document.getElementById('modal-newfolder-input').value.trim();
  if (!name) return;
  const placeholder = `lib/${name}/.gitkeep`;
  EditorState.files[placeholder] = '';
  closeModal('modal-newfolder');
  refreshTree();
}

function confirmRename() {
  const newName = document.getElementById('modal-rename-input').value.trim();
  if (!newName || !EditorState.contextTarget) return;
  const parts = EditorState.contextTarget.split('/');
  parts[parts.length - 1] = newName;
  const newPath = parts.join('/');
  EditorState.files[newPath] = EditorState.files[EditorState.contextTarget];
  delete EditorState.files[EditorState.contextTarget];
  if (EditorState.activeTab === EditorState.contextTarget) EditorState.activeTab = newPath;
  const tabIdx = EditorState.openTabs.indexOf(EditorState.contextTarget);
  if (tabIdx !== -1) EditorState.openTabs[tabIdx] = newPath;
  closeModal('modal-rename');
  refreshTree();
  refreshTabs();
}

function collapseAll() {
  document.querySelectorAll('.tree-children').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tree-folder-toggle').forEach(el => el.classList.remove('open'));
}

/* ── Build ── */
const buildSteps = [
  { label: 'Resolving dependencies...', pct: 10, delay: 600 },
  { label: 'Running pub get...', pct: 22, delay: 900 },
  { label: 'Analyzing project...', pct: 35, delay: 700 },
  { label: 'Compiling Dart code...', pct: 50, delay: 1200 },
  { label: 'Building Flutter app...', pct: 65, delay: 1000 },
  { label: 'Generating APK...', pct: 80, delay: 1100 },
  { label: 'Signing APK...', pct: 92, delay: 700 },
  { label: 'Uploading to storage...', pct: 98, delay: 600 },
  { label: 'Build complete!', pct: 100, delay: 400 },
];

function addLog(text, type = '') {
  const log = document.getElementById('build-log');
  const empty = log.querySelector('.log-empty');
  if (empty) empty.remove();
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-time">${time}</span><span class="log-text ${type}">${text}</span>`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

async function startBuild() {
  if (EditorState.buildRunning) return;
  EditorState.buildRunning = true;

  const btn = document.getElementById('build-btn');
  const progress = document.getElementById('build-progress');
  const downloadBar = document.getElementById('download-bar');
  const appName = document.getElementById('build-app-name').value || 'MyApp';

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Building...`;
  progress.style.display = 'flex';
  downloadBar.classList.remove('visible');

  // Switch to log tab
  const logTab = document.querySelectorAll('.right-panel-tab')[2];
  switchRightTab('log', logTab);

  addLog(`Starting build for "${appName}"`, 'info');
  addLog(`Flutter version: ${document.getElementById('build-flutter').value}`, 'muted');
  addLog(`Package: ${document.getElementById('build-package').value}`, 'muted');
  addLog(`Version: ${document.getElementById('build-version').value}+${document.getElementById('build-vcode').value}`, 'muted');
  addLog('---', 'muted');

  for (const step of buildSteps) {
    await new Promise(r => setTimeout(r, step.delay));
    document.getElementById('build-step-label').textContent = step.label;
    document.getElementById('build-pct').textContent = step.pct + '%';
    document.getElementById('build-progress-bar').style.width = step.pct + '%';
    addLog(step.label, step.pct === 100 ? 'success' : '');
  }

  addLog(`APK ready: ${appName.replace(/\s+/g,'_').toLowerCase()}-release.apk`, 'success');
  addLog('Stored for 7 days. Download before it expires.', 'muted');

  btn.disabled = false;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><polygon points="5,3 19,12 5,21"/></svg> Build APK`;
  progress.style.display = 'none';
  downloadBar.classList.add('visible');
  EditorState.buildRunning = false;

  // Switch to build tab to show download
  const buildTab = document.querySelectorAll('.right-panel-tab')[1];
  switchRightTab('build', buildTab);
}

function downloadAPK() {
  addLog('Download initiated by user.', 'info');
  alert('APK download will work when backend is connected. Coming soon!');
}

/* ── Init ── */
refreshTree();
// File akan di-load dari project user nanti
// openFile('lib/main.dart');
