/* ==========================================
   APKFORGE - Build Engine Logic
   A Khyz Project
   ========================================== */

const Build = {

  // Build config
  config: {
    appName: 'My Flutter App',
    packageId: 'com.example.myapp',
    versionName: '1.0.0',
    versionCode: 1,
    flutterVersion: '3.24',
  },

  // Current build state
  state: {
    running: false,
    buildId: null,
    status: null, // 'queued' | 'running' | 'success' | 'failed'
    progress: 0,
    logs: [],
    apkUrl: null,
    startedAt: null,
  },

  // Build steps for UI display
  steps: [
    { id: 'init',     label: 'Initializing environment...' },
    { id: 'deps',     label: 'Resolving dependencies...' },
    { id: 'pubget',   label: 'Running flutter pub get...' },
    { id: 'analyze',  label: 'Analyzing project...' },
    { id: 'compile',  label: 'Compiling Dart code...' },
    { id: 'build',    label: 'Building Flutter app...' },
    { id: 'apk',      label: 'Generating APK...' },
    { id: 'sign',     label: 'Signing APK...' },
    { id: 'upload',   label: 'Uploading to storage...' },
    { id: 'done',     label: 'Build complete!' },
  ],

  // Trigger a new build (will call backend API when ready)
  async trigger(files, config) {
    if (this.state.running) {
      console.warn('Build already running!');
      return null;
    }

    this.state.running = true;
    this.state.buildId = 'build_' + Date.now();
    this.state.status = 'queued';
    this.state.logs = [];
    this.state.apkUrl = null;
    this.state.startedAt = Date.now();
    this.state.progress = 0;

    if (config) Object.assign(this.config, config);

    this.addLog('info', `Build started: ${this.config.appName}`);
    this.addLog('muted', `Package: ${this.config.packageId}`);
    this.addLog('muted', `Version: ${this.config.versionName}+${this.config.versionCode}`);
    this.addLog('muted', `Flutter: ${this.config.flutterVersion}`);
    this.addLog('muted', '---');

    // TODO: Replace with real API call when backend ready
    // const res = await fetch('/api/build/trigger', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ files, config: this.config, buildId: this.state.buildId })
    // });
    // const data = await res.json();
    // this.pollStatus(data.buildId);

    // For now: simulate build locally
    await this.simulateBuild();

    return this.state.buildId;
  },

  // Simulate build steps (remove when backend ready)
  async simulateBuild() {
    this.state.status = 'running';

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const delay = 500 + Math.random() * 800;

      await new Promise(r => setTimeout(r, delay));

      this.state.progress = Math.round(((i + 1) / this.steps.length) * 100);
      this.addLog(i === this.steps.length - 1 ? 'success' : '', step.label);

      // Emit progress event for UI to listen
      this.emit('progress', {
        step: step.id,
        label: step.label,
        percent: this.state.progress,
        index: i,
      });
    }

    this.state.status = 'success';
    this.state.running = false;
    this.state.apkUrl = '#mock-download-url';

    const duration = ((Date.now() - this.state.startedAt) / 1000).toFixed(1);
    this.addLog('success', `APK ready! Build time: ${duration}s`);
    this.addLog('muted', 'File stored for 7 days. Download before it expires.');

    this.emit('complete', {
      status: 'success',
      apkUrl: this.state.apkUrl,
      duration,
    });
  },

  // Poll build status from backend (use when backend ready)
  async pollStatus(buildId) {
    const interval = setInterval(async () => {
      try {
        // const res = await fetch(`/api/build/status/${buildId}`);
        // const data = await res.json();
        // this.handleStatusUpdate(data);
        // if (data.status === 'success' || data.status === 'failed') {
        //   clearInterval(interval);
        // }
      } catch (err) {
        console.error('Poll error:', err);
        clearInterval(interval);
      }
    }, 3000);
  },

  // Add a log line
  addLog(type, text) {
    const entry = {
      type,
      text,
      time: new Date().toLocaleTimeString('en-GB'),
    };
    this.state.logs.push(entry);
    this.emit('log', entry);
  },

  // Simple event emitter
  _listeners: {},

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  },

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(l => l !== cb);
  },

  emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  },

  // Reset state
  reset() {
    this.state = {
      running: false,
      buildId: null,
      status: null,
      progress: 0,
      logs: [],
      apkUrl: null,
      startedAt: null,
    };
    this._listeners = {};
  },

};
