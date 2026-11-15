const mongoose = require('mongoose');

// eto yung mga makikita sa mongoDB, makikita dito yung mga nag login sa app.

const loginEventSchema = new mongoose.Schema(
  {
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    
    loggedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false },
);


module.exports = mongoose.model('LoginEvent', loginEventSchema);
