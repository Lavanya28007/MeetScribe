const express = require('express');
const Model = require('../models/UserModel');
const Summary = require('../models/SummaryModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const router = express.Router();

/* ---------- Auth Middleware ---------- */
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/* ---------- Google Login ---------- */
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, image } = req.body;
    let user = await Model.findOne({ email });
    if (!user) {
      user = await Model.create({ email, name, image, provider: "google" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name, image: user.image },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: "Google login success", token, user });
  } catch (err) {
    res.status(500).json({ message: "Google login failed", error: err });
  }
});

/* ---------- Register ---------- */
router.post('/register', (req, res) => {
  new Model(req.body).save()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
});

/* ---------- Authenticate (email + password) ---------- */
router.post('/authenticate', (req, res) => {
  const { email, password } = req.body;
  Model.findOne({ email, password })
    .then(result => {
      if (!result) return res.status(401).json({ message: 'Invalid credentials' });
      const { _id, email, name, image } = result;
      jwt.sign(
        { _id, email, name, image },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) return res.status(500).json(err);
          res.status(200).json({ token, _id, email, name, image });
        }
      );
    })
    .catch(err => res.status(500).json(err));
});

/* ---------- Get current user (for extension on startup) ---------- */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await Model.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err });
  }
});

/* ---------- History: get all summaries for logged-in user ---------- */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('meetingTitle summary actionItems createdAt');
    res.status(200).json({ summaries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history', error: err });
  }
});

/* ---------- History: delete a summary ---------- */
router.delete('/history/:id', verifyToken, async (req, res) => {
  try {
    const summary = await Summary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id  // ensure user owns it
    });
    if (!summary) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting', error: err });
  }
});

/* ---------- Existing CRUD ---------- */
router.get('/getall', (req, res) => {
  Model.find()
    .then(result => res.status(200).json({ message: "Users fetched successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error fetching users", error: err }));
});

router.get('/getbyemail/:email', (req, res) => {
  Model.findOne({ email: req.params.email })
    .then(result => res.status(200).json({ message: "User fetched successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error fetching user", error: err }));
});

router.get('/getbyid/:id', (req, res) => {
  Model.findById(req.params.id)
    .then(result => res.status(200).json({ message: "User fetched successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error fetching user", error: err }));
});

router.delete('/delete/:id', (req, res) => {
  Model.findByIdAndDelete(req.params.id)
    .then(result => res.status(200).json({ message: "User deleted successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error deleting user", error: err }));
});

router.put('/update/:id', (req, res) => {
  Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(result => res.status(200).json({ message: "User updated successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error updating user", error: err }));
});

module.exports = router;