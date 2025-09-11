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
  const { type, description, carbonFootprint } = req.body;

  if (!type || !description || carbonFootprint === undefined) {
    return res.status(400).json({ 
      error: 'Type, description, and carbon footprint are required' 
    });
  }

  const validTypes = ['transport', 'energy', 'food', 'waste', 'other'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: `Type must be one of: ${validTypes.join(', ')}` 
    });
  }

  if (carbonFootprint < 0) {
    return res.status(400).json({ 
      error: 'Carbon footprint cannot be negative' 
    });
  }

  if (description.length > 500) {
    return res.status(400).json({ 
      error: 'Description cannot exceed 500 characters' 
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateActivity
};