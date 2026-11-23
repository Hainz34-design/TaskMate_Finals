const express = require('express');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

const router = express.Router();

// Reads "Authorization: Bearer <token>" and sets req.userId.
// Adjust the payload field below to match what your login route signs.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not signed in.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    if (!req.userId) throw new Error('No user id in token');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

router.use(requireAuth);

// GET /api/tasks  -> all tasks for the signed-in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Could not load tasks.' });
  }
});

// POST /api/tasks  -> create a task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, time, priority, subject, reminder, repeat } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }
    const task = await Task.create({
      user: req.userId,
      title,
      description,
      dueDate,
      time,
      priority,
      subject,
      reminder,
      repeat,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Could not save the task.' });
  }
});

// PATCH /api/tasks/:id  -> update (e.g. mark done)
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'description', 'dueDate', 'time', 'priority', 'subject', 'reminder', 'repeat', 'completed'];
    const changes = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) changes[key] = req.body[key];
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      changes,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Could not update the task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete the task.' });
  }
});

module.exports = router;
