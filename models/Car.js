const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
   name: String,
  year: Number,
  price: Number, // <-- changed from selling_price
  kms_driven: Number, // <-- changed from km_driven
  fuel_type: String, // <-- changed from fuel
  transmission: String,
  owner: String,
  seller_type: String,
  createdBy: String,
  location: String,
  source: String
}
  
);

module.exports = mongoose.model("Car", carSchema);



