import React, { useEffect, useState } from "react";
import API from "../services/api"; // your axios instance
import "./DashboardSummary.css";

function DashboardSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Unable to load dashboard data.</p>;

  return (
    <div className="dashboard-summary">
      <h2>🌍 My Carbon Dashboard</h2>

      {/* Quick stats */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Emissions</h3>
          <p>{data.totalEmissions} kg CO₂</p>
        </div>
        <div className="card">
          <h3>Community Avg</h3>
          <p>{data.communityAverage} kg CO₂</p>
        </div>
        <div className="card">
          <h3>My Activities</h3>
          <p>{data.activitiesCount}</p>
        </div>
        <div className="card">
          <h3>Performance</h3>
          <p>{data.performanceScore}</p>
        </div>
      </div>

      {/* Comparison */}
      <p className="comparison">
        Difference vs community: {data.comparisonToCommunity} kg CO₂
      </p>

      {/* Weekly Breakdown */}
      <section>
        <h3>📅 Weekly Breakdown</h3>
        <ul>
          {data.weeklyBreakdown.map((week, i) => (
            <li key={i}>
              {week.week}: {week.emissions} kg CO₂ ({week.activitiesCount} activities)
            </li>
          ))}
        </ul>
      </section>

      {/* Emissions by Category */}
      <section>
        <h3>📊 By Category</h3>
        <ul>
          {data.emissionsByCategory.map((cat, i) => (
            <li key={i}>
              {cat.type}: {cat.emissions} kg CO₂
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default DashboardSummary;
