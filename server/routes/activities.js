// routes/activities.js - Updated Activity routes with automatic carbon calculation
const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');
const { validateActivity } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Add new activity (carbon footprint calculated automatically)
router.post('/', validateActivity, async (req, res) => {
  try {
    const { 
      activityName, 
      activityType, 
      description, 
      quantity, 
      activityDetails,
      date 
    } = req.body;

    const activity = new Activity({
      userId: req.user._id,
      activityName,
      activityType,
      description,
      quantity: {
        value: quantity.value,
        unit: quantity.unit
      },
      activityDetails: activityDetails || {},
      date: date || Date.now()
    });

    // Carbon footprint is calculated automatically via pre-save middleware
    await activity.save();

    res.status(201).json({
      message: 'Activity logged successfully',
      activity: {
        ...activity.toObject(),
        calculatedCarbonFootprint: activity.carbonFootprint,
        emissionFactor: activity.emissionFactor
      }
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Error creating activity log' });
  }
});

// Get user's activities with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      activityType, 
      activityName,
      page = 1, 
      limit = 50 
    } = req.query;
    
    let query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Activity type filtering
    if (activityType) {
      query.activityType = activityType;
    }

    // Activity name filtering (case-insensitive partial match)
    if (activityName) {
      query.activityName = { $regex: activityName, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    // Calculate total carbon footprint for filtered results
    const totalCarbonFootprint = await Activity.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$carbonFootprint' } } }
    ]);

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: activities.length,
        totalCount: total
      },
      summary: {
        totalCarbonFootprint: totalCarbonFootprint[0]?.total || 0
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

// Update activity (carbon footprint recalculated automatically)
router.put('/:id', validateActivity, async (req, res) => {
  try {
    const { 
      activityName, 
      activityType, 
      description, 
      quantity, 
      activityDetails,
      date 
    } = req.body;

    const updateData = {
      activityName,
      activityType,
      description,
      quantity: {
        value: quantity.value,
        unit: quantity.unit
      },
      activityDetails: activityDetails || {},
      date
    };

    // Find and update the activity
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      message: 'Activity updated successfully',
      activity: {
        ...activity.toObject(),
        calculatedCarbonFootprint: activity.carbonFootprint,
        emissionFactor: activity.emissionFactor
      }
    });
  } catch (error) {
    console.error('Activity update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
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

    res.json({ 
      message: 'Activity deleted successfully',
      deletedActivity: {
        activityName: activity.activityName,
        carbonFootprint: activity.carbonFootprint
      }
    });
  } catch (error) {
    console.error('Activity deletion error:', error);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});

// Get activity statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate, activityType } = req.query;
    let matchQuery = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Activity type filtering
    if (activityType) {
      matchQuery.activityType = activityType;
    }

    const stats = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalCarbonFootprint: { $sum: '$carbonFootprint' },
          avgCarbonFootprint: { $avg: '$carbonFootprint' },
          maxCarbonFootprint: { $max: '$carbonFootprint' },
          minCarbonFootprint: { $min: '$carbonFootprint' }
        }
      }
    ]);

    const typeBreakdown = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalCarbon: { $sum: '$carbonFootprint' }
        }
      },
      { $sort: { totalCarbon: -1 } }
    ]);

    res.json({
      summary: stats[0] || {
        totalActivities: 0,
        totalCarbonFootprint: 0,
        avgCarbonFootprint: 0,
        maxCarbonFootprint: 0,
        minCarbonFootprint: 0
      },
      breakdown: typeBreakdown
    });
  } catch (error) {
    console.error('Activity stats error:', error);
    res.status(500).json({ error: 'Error fetching activity statistics' });
  }
});

// Get emission factors for reference (helpful for frontend)
router.get('/reference/emission-factors', async (req, res) => {
  try {
    const emissionFactors = {
      transport: {
        car_gasoline: { factor: 0.21, unit: 'kg CO2/km', description: 'Gasoline car' },
        car_diesel: { factor: 0.17, unit: 'kg CO2/km', description: 'Diesel car' },
        car_electric: { factor: 0.05, unit: 'kg CO2/km', description: 'Electric car' },
        car_hybrid: { factor: 0.12, unit: 'kg CO2/km', description: 'Hybrid car' },
        bus: { factor: 0.08, unit: 'kg CO2/km', description: 'Public bus' },
        train: { factor: 0.04, unit: 'kg CO2/km', description: 'Train' },
        plane_domestic: { factor: 0.25, unit: 'kg CO2/km', description: 'Domestic flight' },
        plane_international: { factor: 0.30, unit: 'kg CO2/km', description: 'International flight' },
        motorcycle: { factor: 0.15, unit: 'kg CO2/km', description: 'Motorcycle' },
        bicycle: { factor: 0, unit: 'kg CO2/km', description: 'Bicycle' },
        walking: { factor: 0, unit: 'kg CO2/km', description: 'Walking' }
      },
      energy: {
        coal: { factor: 0.82, unit: 'kg CO2/kWh', description: 'Coal power' },
        natural_gas: { factor: 0.49, unit: 'kg CO2/kWh', description: 'Natural gas' },
        solar: { factor: 0.05, unit: 'kg CO2/kWh', description: 'Solar power' },
        wind: { factor: 0.02, unit: 'kg CO2/kWh', description: 'Wind power' },
        hydro: { factor: 0.03, unit: 'kg CO2/kWh', description: 'Hydroelectric' },
        nuclear: { factor: 0.06, unit: 'kg CO2/kWh', description: 'Nuclear power' },
        grid_average: { factor: 0.45, unit: 'kg CO2/kWh', description: 'Grid average' }
      },
      food: {
        beef: { factor: 27.0, unit: 'kg CO2/kg', description: 'Beef' },
        pork: { factor: 12.1, unit: 'kg CO2/kg', description: 'Pork' },
        chicken: { factor: 6.9, unit: 'kg CO2/kg', description: 'Chicken' },
        fish: { factor: 6.1, unit: 'kg CO2/kg', description: 'Fish' },
        dairy_milk: { factor: 3.2, unit: 'kg CO2/kg', description: 'Milk' },
        dairy_cheese: { factor: 13.5, unit: 'kg CO2/kg', description: 'Cheese' },
        vegetables: { factor: 2.0, unit: 'kg CO2/kg', description: 'Vegetables' },
        fruits: { factor: 1.1, unit: 'kg CO2/kg', description: 'Fruits' },
        grains: { factor: 1.4, unit: 'kg CO2/kg', description: 'Grains' },
        processed_food: { factor: 3.5, unit: 'kg CO2/kg', description: 'Processed food' }
      },
      waste: {
        general_waste_landfill: { factor: 0.5, unit: 'kg CO2/kg', description: 'General waste to landfill' },
        general_waste_incineration: { factor: 0.3, unit: 'kg CO2/kg', description: 'General waste incineration' },
        recycling: { factor: -0.1, unit: 'kg CO2/kg', description: 'Recycling (saves emissions)' },
        compost: { factor: 0.1, unit: 'kg CO2/kg', description: 'Composting' },
        hazardous: { factor: 2.0, unit: 'kg CO2/kg', description: 'Hazardous waste' }
      }
    };

    res.json({
      message: 'Emission factors reference',
      emissionFactors,
      notes: {
        transport: 'Factors are per kilometer traveled',
        energy: 'Factors are per kilowatt-hour consumed',
        food: 'Factors are per kilogram of food consumed',
        waste: 'Factors are per kilogram of waste generated'
      }
    });
  } catch (error) {
    console.error('Emission factors fetch error:', error);
    res.status(500).json({ error: 'Error fetching emission factors' });
  }
});

// Calculate carbon footprint preview (without saving)
router.post('/calculate-preview', validateActivity, async (req, res) => {
  try {
    const { 
      activityType, 
      quantity, 
      activityDetails 
    } = req.body;

    // Create a temporary activity instance for calculation
    const tempActivity = new Activity({
      userId: req.user._id,
      activityName: 'temp',
      activityType,
      description: 'temp',
      quantity,
      activityDetails: activityDetails || {}
    });

    // Calculate carbon footprint without saving
    const carbonFootprint = tempActivity.calculateCarbonFootprint();
    const emissionFactor = tempActivity.emissionFactor;

    res.json({
      calculatedCarbonFootprint: carbonFootprint,
      emissionFactor,
      unit: 'kg CO2',
      calculation: {
        quantity: tempActivity.formattedQuantity,
        activityType,
        activityDetails: activityDetails || {}
      }
    });
  } catch (error) {
    console.error('Carbon calculation preview error:', error);
    res.status(500).json({ error: 'Error calculating carbon footprint preview' });
  }
});

module.exports = router;