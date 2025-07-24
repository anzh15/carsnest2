
// ✅ Firebase Auth + Express + MongoDB Backend (require syntax)

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load Firebase service account (renamed as .js to avoid assert issues)
const serviceAccount = require("./serviceAccountKey.js");

// Models
const Car = require("./models/Car");

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// App setup
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Firebase middleware
const firebaseAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("No token provided");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token", err);
    return res.status(401).send("Unauthorized");
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("🌐 API is live");
});

app.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find(); // Make sure `Car` is imported
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/cars", firebaseAuth, async (req, res) => {
  try {
    const newCar = new Car({ ...req.body, createdBy: req.user.uid });
    await newCar.save();
    res.status(201).send("Car added");
  } catch (err) {
    res.status(500).json({ error: "Failed to add car" });
  }
});

app.put("/cars/:id", firebaseAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car not found");
    if (car.createdBy !== req.user.uid) return res.status(403).send("Forbidden");

    await Car.findByIdAndUpdate(req.params.id, req.body);
    res.send("Car updated");
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/cars/:id", firebaseAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car not found");
    if (car.createdBy !== req.user.uid) return res.status(403).send("Forbidden");

    await Car.findByIdAndDelete(req.params.id);
    res.send("Car deleted");
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
});
//
app.get("/cars/:id", async (req, res) => {
  const { id } = req.params;
  console.log("📥 Request for car ID:", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("❌ Invalid ObjectId");
    return res.status(400).json({ error: "Invalid Car ID format" });
  }

  try {
    const car = await Car.findById(id);
    if (!car) {
      console.log("❌ Car not found in DB");
      return res.status(404).json({ error: "Car not found" });
    }

    console.log("✅ Car found:", car);
    res.json(car);
  } catch (err) {
    console.error("❌ Error in GET /cars/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const idToken = authHeader.split(" ")[1];

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      next();
    })
    .catch(err => {
      console.error("Token verification failed:", err);
      res.status(401).send("Unauthorized");
    });
});


// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
