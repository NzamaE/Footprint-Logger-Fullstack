import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ActivitySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Activity management states
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityFilters, setActivityFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    type: '',
    description: '',
    carbonFootprint: '',
    details: {}
  });

  const activityTypes = [
    'transport',    
    'energy',       
    'food',         
    'waste',        
    'other'         
  ];

  // Fetch activities with filters
  useEffect(() => {
    fetchActivities();
  }, [activityFilters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activityFilters.type) params.append('type', activityFilters.type);
      if (activityFilters.startDate) params.append('startDate', activityFilters.startDate);
      if (activityFilters.endDate) params.append('endDate', activityFilters.endDate);
      params.append('page', activityFilters.page);
      params.append('limit', '10');

      const response = await API.get(`/activities?${params.toString()}`);
      setActivities(response.data.activities || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new activity
  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...newActivity,
        carbonFootprint: parseFloat(newActivity.carbonFootprint)
      };
      
      await API.post('/activities', activityData);
      
      setNewActivity({
        type: '',
        description: '',
        carbonFootprint: '',
        details: {}
      });
      setShowAddActivity(false);
      fetchActivities();
      
      alert('Activity added successfully!');
    } catch (err) {
      console.error('Error adding activity:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Unknown error';
      alert(`Error adding activity: ${errorMessage}`);
    }
  };

  // Update activity
  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/activities/${editingActivity._id}`, {
        ...editingActivity,
        carbonFootprint: parseFloat(editingActivity.carbonFootprint)
      });
      
      setEditingActivity(null);
      fetchActivities();
      alert('Activity updated successfully!');
    } catch (err) {
      console.error('Error updating activity:', err);
      alert('Error updating activity. Please try again.');
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      await API.delete(`/activities/${activityId}`);
      fetchActivities();
      alert('Activity deleted successfully!');
    } catch (err) {
      console.error('Error deleting activity:', err);
      alert('Error deleting activity. Please try again.');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setActivityFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setActivityFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <>
      <section className="activities-section">
        <div className="section-header">
          <h2>Your Recent Activities</h2>
          <div className="activity-filters">
            <select
              value={activityFilters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              value={activityFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-date"
            />
            <input
              type="date"
              value={activityFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-date"
            />
          </div>
        </div>

        {loading ? (
          <div className="loader" />
        ) : error ? (
          <p style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</p>
        ) : activities.length > 0 ? (
          <>
            <div className="activities-grid">
              {activities.map((activity) => (
                <div key={activity._id} className="activity-card">
                  <div className="activity-header">
                    <span className="activity-type">{activity.type}</span>
                    <div className="activity-actions">
                      <button 
                        onClick={() => setEditingActivity(activity)}
                        className="edit-btn"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteActivity(activity._id)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-emissions">
                    <strong>{activity.carbonFootprint} kg CO₂</strong>
                  </div>
                  <small className="activity-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.current <= 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                  className="page-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.current} of {pagination.total}
                </span>
                <button
                  disabled={pagination.current >= pagination.total}
                  onClick={() => handlePageChange(pagination.current + 1)}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No activities found. Start tracking your carbon footprint!</p>
            <button 
              onClick={() => setShowAddActivity(true)}
              className="cta-button"
            >
              Add Your First Activity
            </button>
          </div>
        )}
      </section>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="modal-overlay" onClick={() => setShowAddActivity(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Activity</h3>
            <form onSubmit={handleAddActivity}>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  required
                >
                  <option value="">Select type</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  required
                  placeholder="Describe your activity..."
                />
              </div>
              <div className="form-group">
                <label>Carbon Footprint (kg CO₂):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newActivity.carbonFootprint}
                  onChange={(e) => setNewActivity({...newActivity, carbonFootprint: e.target.value})}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddActivity(false)}>
                  Cancel
                </button>
                <button type="submit">Add Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="modal-overlay" onClick={() => setEditingActivity(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Activity</h3>
            <form onSubmit={handleUpdateActivity}>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={editingActivity.type}
                  onChange={(e) => setEditingActivity({...editingActivity, type: e.target.value})}
                  required
                >
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editingActivity.description}
                  onChange={(e) => setEditingActivity({...editingActivity, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Carbon Footprint (kg CO₂):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingActivity.carbonFootprint}
                  onChange={(e) => setEditingActivity({...editingActivity, carbonFootprint: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingActivity(null)}>
                  Cancel
                </button>
                <button type="submit">Update Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivitySection;