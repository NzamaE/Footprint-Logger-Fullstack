// server.js - Server startup file
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Footprint Logger server running on port ${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('POST /api/auth/register - Register new user');
  console.log('POST /api/auth/login - Login user');
  console.log('POST /api/activities - Add activity log');
  console.log('GET /api/activities - Get user activities');
  console.log('GET /api/dashboard - Get dashboard data with community comparison');
  console.log('GET /api/streak - Get weekly summaries and streak tracking');
  console.log('GET /api/leaderboard - Get low-footprint users leaderboard');
});
