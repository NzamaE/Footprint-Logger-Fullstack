import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Streak = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const response = await API.get("/streak");
        setStreak(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching streak:', err);
        setError('Failed to load streak data');
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeUser("user");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  return (
    <div className="card">
      <h3>🔥 Current Streak</h3>
      {loading ? (
        <div className="loader" />
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>
      ) : (
        <p>{streak?.currentStreak || 0} days</p>
      )}
    </div>
  );
};

export default Streak;