import React, { useState, useEffect } from 'react';
import API from '../services/api';

const CommunityAverage = () => {
  const [communityAverage, setCommunityAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunityAverage = async () => {
      try {
        setLoading(true);
        const response = await API.get("/dashboard");
        setCommunityAverage(response.data.communityAverage || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching community average:', err);
        setError('Failed to load community data');
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityAverage();
  }, []);

  return (
    <div className="card">
      <h3>👥 Community Avg</h3>
      {loading ? (
        <div className="loader" />
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>
      ) : (
        <p>{communityAverage} kg CO₂</p>
      )}
    </div>
  );
};

export default CommunityAverage;