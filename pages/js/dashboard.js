/* ==========================================
   APKFORGE - Dashboard Logic
   ========================================== */

// Will connect to Supabase for real data
const Dashboard = {
  async loadStats() {
    // TODO: fetch from Supabase
    // const { data } = await supabase
    //   .from('builds')
    //   .select('*')
    //   .eq('user_id', Auth.userId())
    console.log('Dashboard stats loaded (mock)');
  },

  async loadRecentBuilds() {
    // TODO: fetch from Supabase
    console.log('Recent builds loaded (mock)');
  }
};
