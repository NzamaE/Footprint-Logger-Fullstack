import React, { useEffect, useState } from "react";
import TotalEmissions from "../components/TotalEmissions";
import CommunityAverage from "../components/CommunityAverage";
import Streak from "../components/Streak";
import ActivitySection from "../components/ActivitySection";
import Leaderboard from "../components/Leaderboard";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);

  // Load user info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
        <h2 className="sidebar-title">EcoTracker</h2>
        <ul className="sidebar-menu">
          <li>Home</li>
          <li>Analytics</li>
          <li>Settings</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Top navigation bar */}
        <nav className="dashboard-topnav">
          <input
            type="text"
            placeholder="Search activities..."
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
            Welcome back{user ? `, ${user.username}` : ""}! 
          </h1>
          <p>Track your carbon footprint and make a difference.</p>
        </header>

        {/* Dashboard cards - Each component handles its own data */}
        <section className="dashboard-cards">
          <TotalEmissions />
          <CommunityAverage />
          <Streak />
        </section>

        {/* Activities Section - Fully self-contained with all functionality */}
        <ActivitySection />

        {/* Leaderboard - Handles its own data fetching */}
        <Leaderboard />
      </main>
    </div>
  );
}

export default Dashboard;