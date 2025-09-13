import React from "react";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2 className="sidebar-title">MyApp</h2>
        <ul className="sidebar-menu">
          <li>🏠 Home</li>
          <li>📊 Analytics</li>
          <li>⚙️ Settings</li>
          <li>🚪 Logout</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* 🔹 Top navigation bar */}
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
          <h1>Welcome to your Dashboard</h1>
          <p>Here’s an overview of your activity.</p>
        </header>

        {/* Dashboard cards */}
        <section className="dashboard-cards">
          <div className="card">
            <h3>Users</h3>
            <p>1,240</p>
          </div>
          <div className="card">
            <h3>Sales</h3>
            <p>$12,430</p>
          </div>
          <div className="card">
            <h3>Messages</h3>
            <p>57</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
