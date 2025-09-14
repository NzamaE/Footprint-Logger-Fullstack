import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(null);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingStreak, setLoadingStreak] = useState(true);

  // Load user info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [db, act, lb, st] = await Promise.all([
          API.get("/dashboard"),
          API.get("/activities"),
          API.get("/leaderboard"),
          API.get("/streak"),
        ]);

        setDashboard(db.data);
        setLoadingDashboard(false);

        setActivities(act.data);
        setLoadingActivities(false);

        setLeaderboard(lb.data.leaderboard || []);
        setLoadingLeaderboard(false);

        setStreak(st.data);
        setLoadingStreak(false);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2 className="sidebar-title">MyApp</h2>
        <ul className="sidebar-menu">
          <li>🏠 Home</li>
          <li>📊 Analytics</li>
          <li>⚙️ Settings</li>
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Top navigation bar */}
        <nav className="dashboard-topnav">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <div className="topnav-right">
            <span className="notification">🔔</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="profile-avatar"
            />
          </div>
        </nav>

        {/* Page Header */}
        <header className="dashboard-header">
          <h1>
            Welcome back{user ? `, ${user.username}` : ""}! 👋
          </h1>
          <p>Here’s an overview of your activity.</p>
        </header>

        {/* Dashboard cards */}
        <section className="dashboard-cards">
          <div className="card">
            <h3>Total Emissions</h3>
            {loadingDashboard ? <div className="loader" /> : <p>{dashboard.totalEmissions} kg</p>}
          </div>
          <div className="card">
            <h3>Community Avg</h3>
            {loadingDashboard ? <div className="loader" /> : <p>{dashboard.communityAverage} kg</p>}
          </div>
          <div className="card">
            <h3>Streak</h3>
            {loadingStreak ? <div className="loader" /> : <p>{streak.currentStreak} days</p>}
          </div>
        </section>

        {/* Activities */}
        <section>
          <h2>Your Recent Activities</h2>
          {loadingActivities ? (
            <div className="loader" />
          ) : activities.length > 0 ? (
            <ul>
              {activities.map((a, i) => (
                <li key={i}>
                  {a.type} — {a.emissions} kg CO₂
                </li>
              ))}
            </ul>
          ) : (
            <p>No activities yet.</p>
          )}
        </section>

        {/* Leaderboard */}
        <section>
          <h2>Leaderboard</h2>
          {loadingLeaderboard ? (
            <div className="loader" />
          ) : leaderboard.length > 0 ? (
            <ol>
              {leaderboard.map((u, i) => (
                <li key={i}>
                  {u.username} — {u.totalEmissions} kg CO₂
                </li>
              ))}
            </ol>
          ) : (
            <p>No leaderboard data.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
