import React, { useState, useEffect } from 'react';
import API from '../services/api';

const TotalEmissions = () => {
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalEmissions = async () => {
      try {
        setLoading(true);
        const response = await API.get("/dashboard");
        setTotalEmissions(response.data.totalEmissions || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching total emissions:', err);
        setError('Failed to load emissions data');
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTotalEmissions();
  }, []);

  return (
    <div className="card">
      <h3>💨 Total Emissions</h3>
      {loading ? (
        <div className="loader" />
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>
      ) : (
        <p>{totalEmissions} kg CO₂</p>
      )}
    </div>
  );
};

export default TotalEmissions;