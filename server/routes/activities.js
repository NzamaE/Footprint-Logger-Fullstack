// routes/activities.js - Activity routes
const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');
const { validateActivity } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);




// Add new activity
router.post('/', validateActivity, async (req, res) => {
  try {
    const { type, description, carbonFootprint, details } = req.body;

    const activity = new Activity({
      userId: req.user._id,
      type,
      description,
      carbonFootprint,
      details: details || {}
    });

    await activity.save();
    res.status(201).json({
      message: 'Activity logged successfully',
      activity
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(500).json({ error: 'Error creating activity log' });
  }
});








// Get user's activities with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 50 } = req.query;
    let query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Type filtering
    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: activities.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Error fetching activities' });
  }
});









// Get single activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Error fetching activity' });
  }
});









// Update activity
router.put('/:id', validateActivity, async (req, res) => {
  try {
    const { type, description, carbonFootprint, details } = req.body;

    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { type, description, carbonFootprint, details },
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Activity update error:', error);
    res.status(500).json({ error: 'Error updating activity' });
  }
});





// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Activity deletion error:', error);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});

module.exports = router;