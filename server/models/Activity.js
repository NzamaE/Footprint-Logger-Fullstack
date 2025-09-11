// models/Activity.js - Activity model
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: {
      values: ['transport', 'energy', 'food', 'waste', 'other'],
      message: 'Type must be one of: transport, energy, food, waste, other'
    }
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  carbonFootprint: { 
    type: Number, 
    required: true,
    min: [0, 'Carbon footprint cannot be negative']
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  details: {
    // Transport details
    distance: { 
      type: Number, 
      min: 0 
    },
    fuelType: { 
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'public_transport', 'walking', 'cycling']
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bus', 'train', 'plane', 'bike', 'walking']
    },
    
    // Energy details
    energyUsage: { 
      type: Number, 
      min: 0 
    },
    energySource: {
      type: String,
      enum: ['coal', 'natural_gas', 'solar', 'wind', 'hydro', 'nuclear', 'mixed']
    },
    
    // Food details
    mealType: { 
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    foodCategory: {
      type: String,
      enum: ['meat', 'dairy', 'vegetables', 'grains', 'processed', 'organic', 'local']
    },
    
    // Waste details
    wasteAmount: { 
      type: Number, 
      min: 0 
    },
    wasteType: {
      type: String,
      enum: ['general', 'recycling', 'compost', 'hazardous']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
