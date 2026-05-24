/* ==========================================
   APKFORGE - Router
   A Khyz Project
   ========================================== */

const Router = {

  // Page roles: 'public' = no auth needed, 'user' = need login, 'admin' = need admin
  routes: {
    '/index.html': 'public',
    '/': 'public',
    '/pages/login.html': 'public',
    '/pages/dashboard.html': 'user',
    '/pages/editor.html': 'user',
    '/pages/projects.html': 'user',
    '/pages/analyzer.html': 'user',
    '/pages/admin/index.html': 'admin',
    '/pages/admin/users.html': 'admin',
    '/pages/admin/builds.html': 'admin',
  },

  // Get current path (normalized)
  currentPath() {
    return window.location.pathname.replace(/^.*\/apkforge/, '') || '/';
  },

  // Get session from localStorage (placeholder until Supabase)
  getSession() {
    try {
      const raw = localStorage.getItem('apkforge_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  isAdmin() {
    const session = this.getSession();
    return session && session.role === 'admin';
  },

  // Main guard — call this at top of every protected page
  guard() {
    const path = this.currentPath();
    const role = this.routes[path] || 'public';

    if (role === 'user' && !this.isLoggedIn()) {
      this.redirect('/pages/login.html');
      return false;
    }

    if (role === 'admin' && !this.isAdmin()) {
      if (!this.isLoggedIn()) {
        this.redirect('/pages/login.html');
      } else {
        this.redirect('/pages/dashboard.html');
      }
      return false;
    }

    // Redirect logged-in users away from login page
    if (path === '/pages/login.html' && this.isLoggedIn()) {
      this.redirect(this.isAdmin() ? '/pages/admin/index.html' : '/pages/dashboard.html');
      return false;
    }

    return true;
  },

  redirect(path) {
    window.location.href = path;
  },

  // Save session (call after successful login)
  saveSession(user) {
    localStorage.setItem('apkforge_session', JSON.stringify(user));
    if (user.username) {
      localStorage.setItem('apkforge_username', user.username);
    }
  },

  // Clear session (call on logout)
  clearSession() {
    localStorage.removeItem('apkforge_session');
    localStorage.removeItem('apkforge_username');
    this.redirect('/pages/login.html');
  },

};

// Auto-run guard on every page load
// Router.guard(); // Uncomment when backend auth is ready
