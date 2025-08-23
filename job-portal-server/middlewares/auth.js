const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

let admin = null;
let firebaseEnabled = false;

if (process.env.FIREBASE_ADMIN_ENABLED === 'true') {
  firebaseEnabled = true;
  try {
    admin = require("firebase-admin");
    const serviceAccount = require("../../serviceAccountKey.json");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log("✅ Firebase Admin initialized");
    }
  } catch (e) {
    console.warn("⚠️ Firebase Admin not initialized. Check serviceAccountKey.json and dependency.");
    firebaseEnabled = false;
  }
}

async function verifyAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token provided" });

  // Try custom JWT first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.authType = "custom";
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    return next();
  } catch (_) {}

  // Try Firebase token if enabled
  if (firebaseEnabled && admin) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.authType = "firebase";
      req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email };
      return next();
    } catch (e) {
      // fallthrough
    }
  }

  return res.status(401).json({ error: "Invalid or expired token" });
}

module.exports = { verifyAuth };
