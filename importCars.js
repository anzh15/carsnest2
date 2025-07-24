console.log("🚀 Script started");

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const Car = require("./models/Car");

async function importData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const rawData = fs.readFileSync("cardekho.json");
    const cars = JSON.parse(rawData);
    console.log("📦 Loaded", cars.length, "cars");

    const formattedCars = cars.map((car) => ({
      name: car.name || "Unknown",
      fuel_type: car.fuel_type || "Petrol",
      transmission: car.transmission || "Manual",
      year: parseInt(car.year) || 2020,
      price: parseFloat(car.price) || 0,
      kms_driven: parseInt(car.kms_driven?.replace(/[^0-9]/g, "")) || 0,
      image_url: car.image_url || "https://via.placeholder.com/200",
      createdBy: "admin",
    }));

    await Car.insertMany(formattedCars);
    console.log(`✅ Imported ${formattedCars.length} cars`);
    process.exit();
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
}

importData();
