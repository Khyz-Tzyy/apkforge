/* ==========================================
   APKFORGE - Auth Logic
   Will connect to Supabase when backend ready
   ========================================== */

// Placeholder for Supabase auth integration
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const Auth = {
  // Check if user is logged in (localStorage placeholder)
  isLoggedIn() {
    return !!localStorage.getItem('apkforge_session');
  },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/pages/login.html';
    }
  },

  // Redirect to dashboard if already logged in
  requireGuest() {
    if (this.isLoggedIn()) {
      window.location.href = '/pages/dashboard.html';
    }
  },

  // Mock logout
  logout() {
    localStorage.removeItem('apkforge_session');
    window.location.href = '/index.html';
  }
};
