const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: String, default: '' }, // MM/DD/YYYY (same format the app uses)
    time: { type: String, default: '' }, // HH:MM AM/PM
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'LOW' },
    subject: { type: String, default: '' }, // category
    reminder: { type: Boolean, default: false },
    repeat: { type: String, default: 'None' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
