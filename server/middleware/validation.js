
// middleware/validation.js - Input validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Username, email, and password are required' 
    });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ 
      error: 'Username must be between 3 and 30 characters' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address' 
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  next();
};

const validateActivity = (req, res, next) => {
  const { activityName, activityType, description, quantity, carbonContribution } = req.body;

  // Check required fields
  if (!activityName || !activityType || !description || !quantity || carbonContribution === undefined) {
    return res.status(400).json({ 
      error: 'Activity name, activity type, description, quantity, and carbon contribution are required' 
    });
  }

  // Validate activity name
  if (activityName.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Activity name cannot be empty' 
    });
  }

  if (activityName.length > 100) {
    return res.status(400).json({ 
      error: 'Activity name cannot exceed 100 characters' 
    });
  }

  // Validate activity type
  const validTypes = ['transport', 'energy', 'food', 'waste', 'other'];
  if (!validTypes.includes(activityType)) {
    return res.status(400).json({ 
      error: `Activity type must be one of: ${validTypes.join(', ')}` 
    });
  }

  // Validate description
  if (description.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Description cannot be empty' 
    });
  }

  if (description.length > 500) {
    return res.status(400).json({ 
      error: 'Description cannot exceed 500 characters' 
    });
  }

  // Validate quantity object
  if (!quantity.value || !quantity.unit) {
    return res.status(400).json({ 
      error: 'Quantity must include both value and unit' 
    });
  }

  // Validate quantity value
  if (typeof quantity.value !== 'number' || isNaN(quantity.value)) {
    return res.status(400).json({ 
      error: 'Quantity value must be a valid number' 
    });
  }

  if (quantity.value < 0) {
    return res.status(400).json({ 
      error: 'Quantity value cannot be negative' 
    });
  }

  // Validate quantity unit
  const validUnits = [
    'km', 'miles', 'm',           // Distance
    'L', 'gallons', 'ml',         // Volume
    'hours', 'minutes', 'days',   // Time
    'kg', 'lbs', 'g',            // Weight
    'kWh', 'MWh', 'BTU',         // Energy
    'items', 'pieces', 'servings' // Count
  ];

  if (!validUnits.includes(quantity.unit)) {
    return res.status(400).json({ 
      error: `Quantity unit must be one of: ${validUnits.join(', ')}` 
    });
  }

  // Validate carbon contribution
  if (typeof carbonContribution !== 'number' || isNaN(carbonContribution)) {
    return res.status(400).json({ 
      error: 'Carbon contribution must be a valid number' 
    });
  }

  if (carbonContribution < 0) {
    return res.status(400).json({ 
      error: 'Carbon contribution cannot be negative' 
    });
  }

  // Validate date if provided
  if (req.body.date) {
    const dateValue = new Date(req.body.date);
    if (isNaN(dateValue.getTime())) {
      return res.status(400).json({ 
        error: 'Date must be a valid date format' 
      });
    }
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateActivity
};