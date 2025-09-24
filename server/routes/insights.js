// routes/insights.js - Insights and recommendations engine
const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All insights routes are protected
router.use(authenticateToken);

// Helper function to get date range
const getDateRange = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Get weekly analysis and insights for user
router.get('/weekly-analysis', async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = getDateRange(7);

    // Get activities from last 7 days
    const weekActivities = await Activity.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    // Analyze emissions by category
    const categoryAnalysis = {};
    let totalWeeklyEmissions = 0;

    weekActivities.forEach(activity => {
      const category = activity.activityType;
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = {
          totalEmissions: 0,
          activityCount: 0,
          activities: []
        };
      }
      
      categoryAnalysis[category].totalEmissions += activity.carbonFootprint;
      categoryAnalysis[category].activityCount += 1;
      categoryAnalysis[category].activities.push({
        name: activity.activityName,
        emissions: activity.carbonFootprint,
        date: activity.date,
        details: activity.activityDetails
      });
      
      totalWeeklyEmissions += activity.carbonFootprint;
    });

    // Find highest emission category
    let highestCategory = null;
    let highestEmissions = 0;

    Object.keys(categoryAnalysis).forEach(category => {
      if (categoryAnalysis[category].totalEmissions > highestEmissions) {
        highestEmissions = categoryAnalysis[category].totalEmissions;
        highestCategory = category;
      }
    });

    // Generate personalized insights and recommendations
    const insights = generateInsights(categoryAnalysis, highestCategory, totalWeeklyEmissions);
    const weeklyTips = generateWeeklyTips(categoryAnalysis, highestCategory);
    const reductionTargets = calculateReductionTargets(categoryAnalysis, totalWeeklyEmissions);

    res.json({
      period: 'Last 7 days',
      totalWeeklyEmissions: parseFloat(totalWeeklyEmissions.toFixed(2)),
      highestEmissionCategory: highestCategory,
      categoryBreakdown: Object.keys(categoryAnalysis).map(category => ({
        category,
        totalEmissions: parseFloat(categoryAnalysis[category].totalEmissions.toFixed(2)),
        activityCount: categoryAnalysis[category].activityCount,
        averagePerActivity: parseFloat((categoryAnalysis[category].totalEmissions / categoryAnalysis[category].activityCount).toFixed(2)),
        percentage: parseFloat(((categoryAnalysis[category].totalEmissions / totalWeeklyEmissions) * 100).toFixed(1))
      })).sort((a, b) => b.totalEmissions - a.totalEmissions),
      insights,
      weeklyTips,
      reductionTargets,
      activitiesThisWeek: weekActivities.length
    });

  } catch (error) {
    console.error('Weekly analysis error:', error);
    res.status(500).json({ error: 'Error generating weekly analysis' });
  }
});

// Get personalized recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = getDateRange(30);

    // Get activities from last 30 days for broader analysis
    const activities = await Activity.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    // Analyze patterns and generate recommendations
    const recommendations = await generatePersonalizedRecommendations(activities, userId);

    res.json({
      recommendations,
      analysisperiod: '30 days',
      totalActivitiesAnalyzed: activities.length
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Error generating recommendations' });
  }
});

// Set weekly reduction goal
router.post('/set-weekly-goal', async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetReduction, category, goalType } = req.body;

    // Validate input
    if (!targetReduction || targetReduction <= 0) {
      return res.status(400).json({ error: 'Target reduction must be a positive number' });
    }

    if (!['percentage', 'absolute'].includes(goalType)) {
      return res.status(400).json({ error: 'Goal type must be percentage or absolute' });
    }

    // Calculate baseline from last week
    const sevenDaysAgo = getDateRange(7);
    const fourteenDaysAgo = getDateRange(14);
    
    const baselineActivities = await Activity.find({
      userId,
      date: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      ...(category && { activityType: category })
    });

    const baselineEmissions = baselineActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);

    // Create weekly goal
    const weeklyGoal = {
      userId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      category: category || 'all',
      goalType,
      targetReduction,
      baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
      currentProgress: 0,
      status: 'active',
      createdAt: new Date()
    };

    // Calculate target based on goal type
    if (goalType === 'percentage') {
      weeklyGoal.targetEmissions = parseFloat((baselineEmissions * (1 - targetReduction / 100)).toFixed(2));
    } else {
      weeklyGoal.targetEmissions = parseFloat((baselineEmissions - targetReduction).toFixed(2));
    }

    // For now, store in user document (you might want a separate Goals collection)
    await User.findByIdAndUpdate(userId, {
      $set: { 
        currentWeeklyGoal: weeklyGoal,
        weeklyGoalHistory: { $slice: -10 } // Keep last 10 goals
      },
      $push: { weeklyGoalHistory: weeklyGoal }
    });

    res.json({
      message: 'Weekly goal set successfully',
      goal: weeklyGoal
    });

  } catch (error) {
    console.error('Set weekly goal error:', error);
    res.status(500).json({ error: 'Error setting weekly goal' });
  }
});

// Get current weekly goal progress
router.get('/weekly-goal-progress', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    const currentGoal = user.currentWeeklyGoal;

    if (!currentGoal || new Date() > currentGoal.endDate) {
      return res.json({ 
        hasActiveGoal: false,
        message: 'No active weekly goal found'
      });
    }

    // Calculate current progress
    const goalStartDate = new Date(currentGoal.startDate);
    const currentActivities = await Activity.find({
      userId,
      date: { $gte: goalStartDate },
      ...(currentGoal.category !== 'all' && { activityType: currentGoal.category })
    });

    const currentEmissions = currentActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
    const progressPercentage = currentGoal.baselineEmissions > 0 
      ? parseFloat((((currentGoal.baselineEmissions - currentEmissions) / currentGoal.baselineEmissions) * 100).toFixed(1))
      : 0;

    const daysRemaining = Math.ceil((currentGoal.endDate - new Date()) / (24 * 60 * 60 * 1000));
    const isOnTrack = currentEmissions <= currentGoal.targetEmissions;

    res.json({
      hasActiveGoal: true,
      goal: currentGoal,
      progress: {
        currentEmissions: parseFloat(currentEmissions.toFixed(2)),
        targetEmissions: currentGoal.targetEmissions,
        baselineEmissions: currentGoal.baselineEmissions,
        reductionAchieved: parseFloat((currentGoal.baselineEmissions - currentEmissions).toFixed(2)),
        progressPercentage,
        isOnTrack,
        daysRemaining,
        activitiesLogged: currentActivities.length
      }
    });

  } catch (error) {
    console.error('Weekly goal progress error:', error);
    res.status(500).json({ error: 'Error fetching weekly goal progress' });
  }
});

// Get emission trends over time
router.get('/trends', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query;
    const periodInt = Math.max(7, Math.min(365, parseInt(period)));
    
    const startDate = getDateRange(periodInt);
    
    const activities = await Activity.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by week for trend analysis
    const weeklyTrends = {};
    
    activities.forEach(activity => {
      const weekStart = new Date(activity.date);
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyTrends[weekKey]) {
        weeklyTrends[weekKey] = {
          weekStart: weekKey,
          totalEmissions: 0,
          activityCount: 0,
          byCategory: {}
        };
      }
      
      weeklyTrends[weekKey].totalEmissions += activity.carbonFootprint;
      weeklyTrends[weekKey].activityCount += 1;
      
      const category = activity.activityType;
      if (!weeklyTrends[weekKey].byCategory[category]) {
        weeklyTrends[weekKey].byCategory[category] = 0;
      }
      weeklyTrends[weekKey].byCategory[category] += activity.carbonFootprint;
    });

    const trendsArray = Object.values(weeklyTrends).sort((a, b) => 
      new Date(a.weekStart) - new Date(b.weekStart)
    );

    // Calculate trend direction
    const trendDirection = calculateTrendDirection(trendsArray);

    res.json({
      period: `${periodInt} days`,
      weeklyTrends: trendsArray,
      trendDirection,
      totalWeeks: trendsArray.length
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Error fetching emission trends' });
  }
});

// Helper function to generate insights
function generateInsights(categoryAnalysis, highestCategory, totalEmissions) {
  const insights = [];

  if (totalEmissions === 0) {
    return [{
      type: 'info',
      title: 'Start Your Journey',
      message: 'No activities logged this week. Start tracking your carbon footprint to get personalized insights!',
      priority: 'high'
    }];
  }

  // High emission category insight
  if (highestCategory) {
    const categoryData = categoryAnalysis[highestCategory];
    const percentage = ((categoryData.totalEmissions / totalEmissions) * 100).toFixed(0);
    
    insights.push({
      type: 'alert',
      title: `${highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1)} is your biggest contributor`,
      message: `${percentage}% of your emissions (${categoryData.totalEmissions.toFixed(1)} kg CO₂) come from ${highestCategory} activities.`,
      category: highestCategory,
      priority: 'high',
      actionable: true
    });
  }

  // Weekly emission level insight
  if (totalEmissions > 50) {
    insights.push({
      type: 'warning',
      title: 'High Weekly Emissions',
      message: `Your weekly emissions (${totalEmissions.toFixed(1)} kg CO₂) are above the global average of 35 kg per week.`,
      priority: 'medium',
      actionable: true
    });
  } else if (totalEmissions < 20) {
    insights.push({
      type: 'success',
      title: 'Great Progress!',
      message: `Your weekly emissions (${totalEmissions.toFixed(1)} kg CO₂) are well below the global average.`,
      priority: 'low',
      actionable: false
    });
  }

  return insights;
}

// Helper function to generate weekly tips
function generateWeeklyTips(categoryAnalysis, highestCategory) {
  const tips = [];

  if (!highestCategory) {
    return [{
      category: 'general',
      tip: 'Start logging daily activities to get personalized reduction tips!',
      potentialSaving: 0,
      difficulty: 'easy'
    }];
  }

  const categoryTips = {
    transport: [
      {
        tip: 'Try cycling or walking for trips under 5km this week',
        potentialSaving: 3.5,
        difficulty: 'medium'
      },
      {
        tip: 'Use public transport twice instead of driving',
        potentialSaving: 2.8,
        difficulty: 'easy'
      },
      {
        tip: 'Combine multiple errands into one trip',
        potentialSaving: 1.5,
        difficulty: 'easy'
      }
    ],
    food: [
      {
        tip: 'Try 2 plant-based meals this week',
        potentialSaving: 4.2,
        difficulty: 'medium'
      },
      {
        tip: 'Reduce red meat consumption by one meal',
        potentialSaving: 6.8,
        difficulty: 'easy'
      },
      {
        tip: 'Buy local, seasonal produce',
        potentialSaving: 2.1,
        difficulty: 'easy'
      }
    ],
    energy: [
      {
        tip: 'Lower thermostat by 2°C when not home',
        potentialSaving: 3.2,
        difficulty: 'easy'
      },
      {
        tip: 'Unplug devices when not in use',
        potentialSaving: 1.8,
        difficulty: 'easy'
      },
      {
        tip: 'Use cold water for washing clothes',
        potentialSaving: 2.5,
        difficulty: 'easy'
      }
    ],
    waste: [
      {
        tip: 'Start composting organic waste',
        potentialSaving: 1.2,
        difficulty: 'medium'
      },
      {
        tip: 'Recycle all eligible materials',
        potentialSaving: 0.8,
        difficulty: 'easy'
      }
    ]
  };

  const categorySpecificTips = categoryTips[highestCategory] || [];
  tips.push(...categorySpecificTips);

  return tips.slice(0, 3); // Return top 3 tips
}

// Helper function to calculate reduction targets
function calculateReductionTargets(categoryAnalysis, totalEmissions) {
  const targets = [];

  Object.keys(categoryAnalysis).forEach(category => {
    const categoryData = categoryAnalysis[category];
    const potentialReduction = categoryData.totalEmissions * 0.15; // 15% reduction target
    
    targets.push({
      category,
      currentEmissions: parseFloat(categoryData.totalEmissions.toFixed(2)),
      targetReduction: parseFloat(potentialReduction.toFixed(2)),
      targetEmissions: parseFloat((categoryData.totalEmissions - potentialReduction).toFixed(2)),
      reductionPercentage: 15
    });
  });

  return targets.sort((a, b) => b.currentEmissions - a.currentEmissions);
}

// Helper function for personalized recommendations
async function generatePersonalizedRecommendations(activities, userId) {
  const recommendations = [];

  // Analyze activity patterns
  const patterns = analyzeActivityPatterns(activities);
  
  // Generate recommendations based on patterns
  if (patterns.highTransportEmissions) {
    recommendations.push({
      type: 'transport',
      title: 'Optimize Your Transportation',
      description: 'Your transport emissions are high. Consider alternative modes of transport.',
      actions: [
        'Use public transport 2 days per week',
        'Walk or cycle for trips under 3km',
        'Plan combined trips to reduce total distance'
      ],
      impact: 'high',
      difficulty: 'medium'
    });
  }

  if (patterns.highFoodEmissions) {
    recommendations.push({
      type: 'food',
      title: 'Sustainable Diet Choices',
      description: 'Food choices significantly impact your carbon footprint.',
      actions: [
        'Try plant-based meals 3 times per week',
        'Buy local and seasonal produce',
        'Reduce food waste by meal planning'
      ],
      impact: 'high',
      difficulty: 'easy'
    });
  }

  if (patterns.inconsistentLogging) {
    recommendations.push({
      type: 'tracking',
      title: 'Improve Activity Tracking',
      description: 'More consistent logging will give you better insights.',
      actions: [
        'Set daily reminders to log activities',
        'Use quick-add templates for common activities',
        'Review and update your log weekly'
      ],
      impact: 'medium',
      difficulty: 'easy'
    });
  }

  return recommendations;
}

// Helper function to analyze activity patterns
function analyzeActivityPatterns(activities) {
  const totalEmissions = activities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
  
  const categoryEmissions = {};
  activities.forEach(activity => {
    categoryEmissions[activity.activityType] = (categoryEmissions[activity.activityType] || 0) + activity.carbonFootprint;
  });

  return {
    highTransportEmissions: (categoryEmissions.transport || 0) > totalEmissions * 0.4,
    highFoodEmissions: (categoryEmissions.food || 0) > totalEmissions * 0.3,
    highEnergyEmissions: (categoryEmissions.energy || 0) > totalEmissions * 0.35,
    inconsistentLogging: activities.length < 14 // Less than 2 activities per week over 30 days
  };
}

// Helper function to calculate trend direction
function calculateTrendDirection(trendsArray) {
  if (trendsArray.length < 2) {
    return { direction: 'stable', change: 0 };
  }

  const recent = trendsArray.slice(-2);
  const change = recent[1].totalEmissions - recent[0].totalEmissions;
  const percentageChange = recent[0].totalEmissions > 0 
    ? (change / recent[0].totalEmissions) * 100 
    : 0;

  let direction = 'stable';
  if (Math.abs(percentageChange) > 5) {
    direction = change > 0 ? 'increasing' : 'decreasing';
  }

  return {
    direction,
    change: parseFloat(change.toFixed(2)),
    percentageChange: parseFloat(percentageChange.toFixed(1))
  };
}

module.exports = router;