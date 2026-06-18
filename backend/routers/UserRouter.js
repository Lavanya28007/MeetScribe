const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const Model   = require("../models/UserModel");   // ← add back
const Summary = require("../models/SummaryModel");
require("dotenv").config();

/* ── Auth middleware ── */
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* ── POST /user/google-login ── */
router.post("/google-login", async (req, res) => {
  try {
    const { email, name, image } = req.body;
    let user = await Model.findOne({ email });
    if (!user) {
      user = await Model.create({ email, name, image, provider: "google" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name, image: user.image },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ message: "Google login success", token, user });
  } catch (err) {
    res.status(500).json({ message: "Google login failed", error: err });
  }
});

/* ── POST /user/register ── */
router.post("/register", (req, res) => {
  new Model(req.body).save()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
});

/* ── POST /user/authenticate ── */
router.post("/authenticate", (req, res) => {
  const { email, password } = req.body;
  Model.findOne({ email, password })
    .then(result => {
      if (!result) return res.status(401).json({ message: "Invalid credentials" });
      const { _id, email, name, image } = result;
      jwt.sign(
        { _id, email, name, image },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) return res.status(500).json(err);
          res.status(200).json({ token, _id, email, name, image });
        }
      );
    })
    .catch(err => res.status(500).json(err));
});

/* ── GET /user/me ── */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await Model.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
});

/* ── GET /user/history ── */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user._id })
      .select(
        "meetingTitle summary transcript actionItems " +
        "starred tags sentiment participants nextMeeting " +
        "duration createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();
    res.json({ summaries });
  } catch (err) {
    console.error("❌ History fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /user/history/:id ── */
router.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    const doc = await Summary.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── CRUD ── */
router.get("/getall", (req, res) => {
  Model.find()
    .then(result => res.status(200).json({ data: result }))
    .catch(err => res.status(500).json(err));
});

router.get("/getbyid/:id", (req, res) => {
  Model.findById(req.params.id)
    .then(result => res.status(200).json({ data: result }))
    .catch(err => res.status(500).json(err));
});

router.get("/getbyemail/:email", (req, res) => {
  Model.findOne({ email: req.params.email })
    .then(result => res.status(200).json({ message: "User fetched successfully", data: result }))
    .catch(err => res.status(500).json({ message: "Error fetching user", error: err }));
});

router.put("/update/:id", (req, res) => {
  Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(result => res.status(200).json({ data: result }))
    .catch(err => res.status(500).json(err));
});

router.delete("/delete/:id", (req, res) => {
  Model.findByIdAndDelete(req.params.id)
    .then(result => res.status(200).json({ data: result }))
    .catch(err => res.status(500).json(err));
});

module.exports = router;