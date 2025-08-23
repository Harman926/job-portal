const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db");
const { verifyAuth } = require("../middlewares/auth");
const router = express.Router();

// Create
router.post("/post-job", verifyAuth, async (req, res) => {
  try {
    const db = getDB();
    const jobs = db.collection("demoJobs");
    const body = req.body;

    body.createdAt = new Date();
    // If JWT auth → req.user.email (our custom). If Firebase → req.user.email from Firebase
    body.postedBy = req.user?.email || body.postedBy || "unknown";

    const result = await jobs.insertOne(body);
    res.json({ insertedId: result.insertedId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not post job" });
  }
});

// Read all
router.get("/all-jobs", async (req, res) => {
  const db = getDB();
  const jobs = db.collection("demoJobs");
  const data = await jobs.find({}).sort({ createdAt: -1 }).toArray();
  res.json(data);
});

// Read single
router.get("/all-jobs/:id", async (req, res) => {
  const db = getDB();
  const jobs = db.collection("demoJobs");
  const job = await jobs.findOne({ _id: new ObjectId(req.params.id) });
  res.json(job);
});

// My jobs (protected so we trust postedBy)
router.get("/my-jobs", verifyAuth, async (req, res) => {
  const db = getDB();
  const jobs = db.collection("demoJobs");
  const email = req.user?.email;
  const data = await jobs.find({ postedBy: email }).sort({ createdAt: -1 }).toArray();
  res.json(data);
});

// Update
router.patch("/update-job/:id", verifyAuth, async (req, res) => {
  const db = getDB();
  const jobs = db.collection("demoJobs");
  const id = req.params.id;
  const updates = req.body;

  const result = await jobs.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  res.json(result);
});

// Delete
router.delete("/job/:id", verifyAuth, async (req, res) => {
  const db = getDB();
  const jobs = db.collection("demoJobs");
  const id = req.params.id;
  const result = await jobs.deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

module.exports = router;
