const mongoose = require('mongoose');

// One document per user. Images are stored as small base64 data URLs.
const profileImageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    avatar: { type: String, default: '' },
    cover: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProfileImage', profileImageSchema);
