import React, { useEffect, useState } from "react";
import API from "../services/api";

function StreakWidget() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    API.get("/streak")
      .then(res => setStreak(res.data))
      .catch(err => console.error("Streak fetch error", err));
  }, []);

  if (!streak) return <div className="card">Loading streak...</div>;

  return (
    <div className="card">
      <h3>Streak</h3>
      <p>🔥 Current: {streak.currentStreak} days</p>
      <p>🏆 Longest: {streak.longestStreak} days</p>
      <p>Total Days: {streak.totalDays}</p>
    </div>
  );
}

export default StreakWidget;
