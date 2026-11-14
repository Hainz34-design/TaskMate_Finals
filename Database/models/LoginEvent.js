const mongoose = require('mongoose');

// makikita dito yung mga nag login sa app.

const loginEventSchema = new mongoose.Schema(
  {
    // Mongo ObjectId link pabalik sa account sa users collection.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Email snapshot para mabasa agad ang event nang hindi naglo-lookup ng user.
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Default sa kasalukuyang oras kapag nag-save ng successful login.
    loggedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false },
);

// I-export para magawa ng login route ang event document.
module.exports = mongoose.model('LoginEvent', loginEventSchema);
