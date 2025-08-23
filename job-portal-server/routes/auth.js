const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection("users");
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 chars" });

    const existing = await users.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, password: hash, createdAt: new Date() });

    res.json({ message: "Signup successful", user: { id: result.insertedId, email, name } });
  } catch (e) {
    console.error(e);
    if (e.code === 11000) return res.status(400).json({ error: "Email already in use" });
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection("users");
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
