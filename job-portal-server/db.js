const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal.gltpmyt.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME || 'Job-Portal'}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME || "mernJobPortal");

  // Ensure unique index on users.email
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  // (Optional) helpful index for jobs
  await db.collection("demoJobs").createIndex({ postedBy: 1, createdAt: -1 });

  await client.db("admin").command({ ping: 1 });
  console.log("✅ Connected to MongoDB");
  return db;
}

function getDB() {
  if (!db) throw new Error("DB not initialized. Call connectDB() first.");
  return db;
}

module.exports = { connectDB, getDB };
