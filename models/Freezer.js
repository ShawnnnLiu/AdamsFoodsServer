const mongoose = require('mongoose');

// Define the schema for the user
const FreezerSchema = new mongoose.Schema({
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
    est: String
});

// Connect the schema to the `UserDatabase` collection
const FreezerModel = mongoose.model("FreezerInventory", FreezerSchema);

module.exports = FreezerModel;
