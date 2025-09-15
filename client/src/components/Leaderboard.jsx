import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await API.get("/leaderboard");
        setLeaderboard(response.data.leaderboard || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <section>
      <h2>🏆 Eco Champions</h2>
      {loading ? (
        <div className="loader" />
      ) : error ? (
        <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
      ) : leaderboard.length > 0 ? (
        <div className="leaderboard-grid">
          {leaderboard.map((user, index) => (
            <div key={index} className="leaderboard-item">
              <div className="rank">#{index + 1}</div>
              <div className="user-info">
                <strong>{user.username}</strong>
                <span>{user.totalEmissions} kg CO₂</span>
              </div>
              {index < 3 && <div className="medal">🏅</div>}
            </div>
          ))}
        </div>
      ) : (
        <p>No leaderboard data available.</p>
      )}
    </section>
  );
};

export default Leaderboard;