const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Connect DB once
connectDB().catch(err => {
  console.error("DB connection failed", err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/Auth');
const jobRoutes  = require('./routes/jobs');

app.use('/api', authRoutes);
app.use('/', jobRoutes); // /post-job, /all-jobs, etc.

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
