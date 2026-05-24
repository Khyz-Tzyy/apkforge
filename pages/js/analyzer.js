/* ==========================================
   APKFORGE - APK Analyzer Logic
   ========================================== */

let selectedFile = null;
let usesLeft = 2;

/* ── Drag & Drop ── */
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.apk')) {
    loadFile(file);
  } else {
    showToast('Please upload a valid .apk file!');
  }
});

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadFile(file);
}

function loadFile(file) {
  if (file.size > 100 * 1024 * 1024) {
    showToast('File too large! Max 100MB.');
    return;
  }
  selectedFile = file;

  document.getElementById('apk-filename').textContent = file.name;
  document.getElementById('apk-filesize').textContent = formatBytes(file.size);

  // Mock APK details (real parsing needs backend)
  const mockDetails = [
    { label: 'Package ID', value: 'com.example.myapp' },
    { label: 'App Name', value: 'My Flutter App' },
    { label: 'Version', value: '1.0.0 (1)' },
    { label: 'Min SDK', value: 'Android 5.0 (API 21)' },
    { label: 'Target SDK', value: 'Android 14 (API 34)' },
    { label: 'File Size', value: formatBytes(file.size) },
  ];

  document.getElementById('apk-details-grid').innerHTML = mockDetails.map(d => `
    <div class="apk-detail-item">
      <div class="apk-detail-label">${d.label}</div>
      <div class="apk-detail-value">${d.value}</div>
    </div>
  `).join('');

  document.getElementById('apk-info-card').classList.add('visible');
  document.getElementById('drop-zone').style.display = 'none';
}

/* ── Analysis ── */
const analysisSteps = [
  { label: 'Unpacking APK archive...' },
  { label: 'Parsing AndroidManifest.xml...' },
  { label: 'Reading DEX files...' },
  { label: 'Scanning resources...' },
  { label: 'Extracting strings...' },
  { label: 'Checking permissions...' },
  { label: 'Building file tree...' },
  { label: 'Analysis complete!' },
];

async function startAnalysis() {
  if (usesLeft <= 0) {
    showToast('Daily limit reached! Resets at midnight.');
    return;
  }

  if (!selectedFile) {
    showToast('Please upload an APK first!');
    return;
  }

  usesLeft--;
  document.getElementById('uses-left').textContent = usesLeft + ' left';
  document.getElementById('usage-badge').textContent = `${2 - usesLeft} / 2 daily uses`;

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Analyzing...`;

  const progressEl = document.getElementById('analyze-progress');
  progressEl.classList.add('visible');

  const stepsEl = document.getElementById('analyze-steps');
  stepsEl.innerHTML = analysisSteps.map((s, i) => `
    <div class="analyze-step" id="astep-${i}">
      <div class="analyze-step-icon step-pending" id="astep-icon-${i}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>
      </div>
      <span class="analyze-step-label" id="astep-label-${i}">${s.label}</span>
    </div>
  `).join('');

  for (let i = 0; i < analysisSteps.length; i++) {
    // Set running
    document.getElementById(`astep-icon-${i}`).className = 'analyze-step-icon step-running';
    document.getElementById(`astep-icon-${i}`).innerHTML = `<div class="spinner" style="width:12px;height:12px;border-width:1.5px"></div>`;
    document.getElementById(`astep-label-${i}`).className = 'analyze-step-label running';

    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

    // Set done
    document.getElementById(`astep-icon-${i}`).className = 'analyze-step-icon step-done';
    document.getElementById(`astep-icon-${i}`).innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>`;
    document.getElementById(`astep-label-${i}`).className = 'analyze-step-label done';
  }

  btn.disabled = false;
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analyze Again`;

  showResults();
}

/* ── Show Results ── */
function showResults() {
  document.getElementById('analyzer-empty').style.display = 'none';
  const results = document.getElementById('analyzer-results');
  results.style.display = 'flex';
  document.getElementById('result-apk-name').textContent = selectedFile.name;

  renderFileTree();
  renderManifest();
  renderPermissions();
  renderStrings();
}

/* ── File Tree ── */
function renderFileTree() {
  const mockFiles = [
    { name: 'AndroidManifest.xml', size: '4.2 KB', type: 'xml' },
    { name: 'classes.dex', size: '2.1 MB', type: 'dex' },
    { name: 'classes2.dex', size: '1.4 MB', type: 'dex' },
    { name: 'resources.arsc', size: '320 KB', type: 'arsc' },
    { name: 'res/', size: '—', type: 'folder', children: [
      { name: 'layout/', size: '—', type: 'folder', children: [
        { name: 'activity_main.xml', size: '2.1 KB', type: 'xml' },
        { name: 'fragment_home.xml', size: '1.8 KB', type: 'xml' },
      ]},
      { name: 'drawable/', size: '—', type: 'folder', children: [
        { name: 'ic_launcher.png', size: '12 KB', type: 'png' },
        { name: 'background.xml', size: '0.5 KB', type: 'xml' },
      ]},
      { name: 'values/', size: '—', type: 'folder', children: [
        { name: 'strings.xml', size: '3.2 KB', type: 'xml' },
        { name: 'colors.xml', size: '0.8 KB', type: 'xml' },
        { name: 'styles.xml', size: '1.1 KB', type: 'xml' },
      ]},
    ]},
    { name: 'lib/', size: '—', type: 'folder', children: [
      { name: 'arm64-v8a/', size: '—', type: 'folder', children: [
        { name: 'libflutter.so', size: '8.4 MB', type: 'so' },
        { name: 'libapp.so', size: '1.2 MB', type: 'so' },
      ]},
    ]},
    { name: 'assets/', size: '—', type: 'folder', children: [
      { name: 'flutter_assets/', size: '—', type: 'folder', children: [
        { name: 'AssetManifest.json', size: '0.3 KB', type: 'json' },
        { name: 'FontManifest.json', size: '0.1 KB', type: 'json' },
      ]},
    ]},
    { name: 'META-INF/', size: '—', type: 'folder', children: [
      { name: 'MANIFEST.MF', size: '1.2 KB', type: 'mf' },
      { name: 'CERT.RSA', size: '0.9 KB', type: 'rsa' },
    ]},
  ];

  const container = document.getElementById('atree-files');
  container.innerHTML = '';
  renderAtree(mockFiles, container, 0);
}

function getAtreeIcon(type) {
  const map = {
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    xml: `<svg viewBox="0 0 24 24" fill="none" stroke="#54c5f8" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`,
    dex: `<svg viewBox="0 0 24 24" fill="none" stroke="#c792ea" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`,
    json: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`,
    png: `<svg viewBox="0 0 24 24" fill="none" stroke="#c3e88d" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>`,
    so: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>`,
  };
  return map[type] || map.xml;
}

function renderAtree(files, container, depth) {
  files.forEach(f => {
    const item = document.createElement('div');
    item.className = 'atree-item';
    item.style.paddingLeft = `${14 + depth * 14}px`;

    if (f.type === 'folder') {
      let open = true;
      item.innerHTML = `
        <svg class="tree-folder-toggle open" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
        ${getAtreeIcon('folder')}
        <span style="color:var(--warning)">${f.name}</span>
        <span class="atree-size">${f.size}</span>
      `;
      container.appendChild(item);

      const childWrap = document.createElement('div');
      renderAtree(f.children || [], childWrap, depth + 1);
      container.appendChild(childWrap);

      item.addEventListener('click', () => {
        open = !open;
        childWrap.style.display = open ? '' : 'none';
        item.querySelector('.tree-folder-toggle').classList.toggle('open', open);
      });
    } else {
      item.innerHTML = `
        <span style="width:10px;display:inline-block"></span>
        ${getAtreeIcon(f.type)}
        <span>${f.name}</span>
        <span class="atree-size">${f.size}</span>
      `;
      item.addEventListener('click', () => {
        document.querySelectorAll('.atree-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        showToast(`Viewing: ${f.name} (coming with backend)`);
      });
      container.appendChild(item);
    }
  });
}

/* ── Manifest ── */
function renderManifest() {
  const manifest = `<span class="manifest-key">&lt;manifest</span> <span class="manifest-attr">xmlns:android</span>=<span class="manifest-value">"http://schemas.android.com/apk/res/android"</span>
  <span class="manifest-attr">package</span>=<span class="manifest-value">"com.example.myapp"</span>
  <span class="manifest-attr">android:versionCode</span>=<span class="manifest-value">"1"</span>
  <span class="manifest-attr">android:versionName</span>=<span class="manifest-value">"1.0.0"</span><span class="manifest-key">&gt;</span>

  <span class="manifest-key">&lt;uses-sdk</span>
    <span class="manifest-attr">android:minSdkVersion</span>=<span class="manifest-value">"21"</span>
    <span class="manifest-attr">android:targetSdkVersion</span>=<span class="manifest-value">"34"</span> <span class="manifest-key">/&gt;</span>

  <span class="manifest-key">&lt;application</span>
    <span class="manifest-attr">android:label</span>=<span class="manifest-value">"@string/app_name"</span>
    <span class="manifest-attr">android:icon</span>=<span class="manifest-value">"@mipmap/ic_launcher"</span>
    <span class="manifest-attr">android:theme</span>=<span class="manifest-value">"@style/Theme.App"</span>
    <span class="manifest-attr">android:allowBackup</span>=<span class="manifest-value">"true"</span><span class="manifest-key">&gt;</span>

    <span class="manifest-key">&lt;activity</span>
      <span class="manifest-attr">android:name</span>=<span class="manifest-value">".MainActivity"</span>
      <span class="manifest-attr">android:exported</span>=<span class="manifest-value">"true"</span>
      <span class="manifest-attr">android:launchMode</span>=<span class="manifest-value">"singleTop"</span><span class="manifest-key">&gt;</span>
      <span class="manifest-key">&lt;intent-filter&gt;</span>
        <span class="manifest-key">&lt;action</span> <span class="manifest-attr">android:name</span>=<span class="manifest-value">"android.intent.action.MAIN"</span> <span class="manifest-key">/&gt;</span>
        <span class="manifest-key">&lt;category</span> <span class="manifest-attr">android:name</span>=<span class="manifest-value">"android.intent.category.LAUNCHER"</span> <span class="manifest-key">/&gt;</span>
      <span class="manifest-key">&lt;/intent-filter&gt;</span>
    <span class="manifest-key">&lt;/activity&gt;</span>

  <span class="manifest-key">&lt;/application&gt;</span>
<span class="manifest-key">&lt;/manifest&gt;</span>`;

  document.getElementById('manifest-content').innerHTML = manifest;
}

/* ── Permissions ── */
function renderPermissions() {
  const perms = [
    { name: 'android.permission.INTERNET', risk: 'safe', label: 'Safe' },
    { name: 'android.permission.CAMERA', risk: 'warning', label: 'Moderate' },
    { name: 'android.permission.READ_EXTERNAL_STORAGE', risk: 'warning', label: 'Moderate' },
    { name: 'android.permission.WRITE_EXTERNAL_STORAGE', risk: 'warning', label: 'Moderate' },
    { name: 'android.permission.ACCESS_FINE_LOCATION', risk: 'danger', label: 'Sensitive' },
    { name: 'android.permission.RECEIVE_BOOT_COMPLETED', risk: 'warning', label: 'Moderate' },
  ];

  document.getElementById('perm-list').innerHTML = perms.map(p => `
    <div class="perm-item">
      <div class="perm-dot ${p.risk}"></div>
      <span class="perm-name">${p.name.replace('android.permission.', '')}</span>
      <span class="perm-risk badge ${p.risk === 'safe' ? 'badge-success' : p.risk === 'warning' ? 'badge-warning' : 'badge-danger'}">${p.label}</span>
    </div>
  `).join('');
}

/* ── Strings ── */
function renderStrings() {
  const strings = `<span style="color:var(--accent)">&lt;resources&gt;</span>
  <span style="color:var(--text-muted)">// App strings extracted from res/values/strings.xml</span>

  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"app_name"</span><span style="color:#54c5f8">&gt;</span>My Flutter App<span style="color:#54c5f8">&lt;/string&gt;</span>
  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"hello_world"</span><span style="color:#54c5f8">&gt;</span>Hello, World!<span style="color:#54c5f8">&lt;/string&gt;</span>
  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"action_settings"</span><span style="color:#54c5f8">&gt;</span>Settings<span style="color:#54c5f8">&lt;/string&gt;</span>
  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"btn_ok"</span><span style="color:#54c5f8">&gt;</span>OK<span style="color:#54c5f8">&lt;/string&gt;</span>
  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"btn_cancel"</span><span style="color:#54c5f8">&gt;</span>Cancel<span style="color:#54c5f8">&lt;/string&gt;</span>
  <span style="color:#54c5f8">&lt;string</span> <span style="color:var(--warning)">name</span>=<span style="color:#c3e88d">"error_generic"</span><span style="color:#54c5f8">&gt;</span>Something went wrong<span style="color:#54c5f8">&lt;/string&gt;</span>

<span style="color:var(--accent)">&lt;/resources&gt;</span>`;

  document.getElementById('strings-content').innerHTML = strings;
}

/* ── Tab Switch ── */
function switchAnalyzerTab(tab, btn) {
  document.querySelectorAll('.analyzer-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.analyzer-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('atab-' + tab).classList.add('active');
  btn.classList.add('active');
}

/* ── Reset ── */
function resetAnalyzer() {
  selectedFile = null;
  document.getElementById('apk-info-card').classList.remove('visible');
  document.getElementById('drop-zone').style.display = '';
  document.getElementById('analyze-progress').classList.remove('visible');
  document.getElementById('analyzer-empty').style.display = '';
  document.getElementById('analyzer-results').style.display = 'none';
  document.getElementById('apk-input').value = '';
  document.getElementById('analyze-btn').disabled = false;
  document.getElementById('analyze-btn').innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    Analyze APK
  `;
}

/* ── Helpers ── */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 2500);
}

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
