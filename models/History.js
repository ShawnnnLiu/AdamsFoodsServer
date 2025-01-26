const mongoose = require("mongoose");

// Define the schema for the history
const HistorySchema = new mongoose.Schema({
  time: String,
  change: String,
  location: String,
  lot: String,
  vendor: String,
  brand: String,
  species: String,
  description: String,
  grade: String,
  quantity: String,
  weight: String,
  packdate: String,
  temp: String,
  est: String,
});

// Connect the schema to the `History` collection
const HistoryModel = mongoose.model("history", HistorySchema);

module.exports = HistoryModel;
