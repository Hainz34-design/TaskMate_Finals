const mongoose = require('mongoose');

// Tinutukoy ng schema na ito ang fields ng bawat document sa users collection.
//eto yung mga makikita sa mongodb yung mga registered users sa app.
const userSchema = new mongoose.Schema(
  {
    // Pangalan na ipinapakita sa Profile; kailangan at nililinis ang extra spaces.
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    // Unique ang email; lowercase normalization para hindi magkaiba ang case.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // Bcrypt hash lang ang sine-save at hidden ito maliban kung tahasang kunin.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  // Awtomatikong idagdag ang createdAt at updatedAt sa bawat user document.
  { timestamps: true },
);

// I-export ang model para makagawa at makahanap ng user mula sa auth routes.
module.exports = mongoose.model('User', userSchema);