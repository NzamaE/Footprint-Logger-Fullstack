import React, { useEffect, useState } from "react";
import API from "../services/api";

function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    API.get("/leaderboard")
      .then(res => setLeaderboard(res.data.leaderboard))
      .catch(err => console.error("Leaderboard fetch error", err));
  }, []);

  return (
    <div className="card">
      <h3>Leaderboard</h3>
      <ol>
        {leaderboard.map(user => (
          <li key={user._id}>
            {user.rank}. {user.username} — {user.totalEmissions} kg
          </li>
        ))}
      </ol>
    </div>
  );
}

export default LeaderboardWidget;
