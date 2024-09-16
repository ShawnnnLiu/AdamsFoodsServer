const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User");
const FreezerModel = require("./models/Freezer");
const app = express();

// JWT auth
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

// MongoDB connection

const MONGODB_URI_SHAWN = process.env.MONGODB_URI_SHAWN;
const MONGODB_URI_ANTHONY = process.env.MONGODB_URI_ANTHONY;

mongoose
  .connect(MONGODB_URI_ANTHONY) // change varaible when you're working on it
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Connection error", err));

const fs = require("fs");

// Global variable to store valid locations
let validLocations = [];

// Read the locations from the .txt file and store in memory
const loadLocations = () => {
  try {
    const data = fs.readFileSync("./locations.txt", "utf8");
    validLocations = data
      .split("\n")
      .map((location) => location.trim())
      .filter(Boolean);
    console.log("Locations loaded successfully");
  } catch (err) {
    console.error("Error reading locations file:", err);
  }
};

// Call this function once when the server starts
loadLocations();

// ----------------- JWT Middleware -----------------
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = decoded.userId; // Attach user ID to request
    next();
  });
};

// ----------------- Inventory Routes -----------------

// Add inventory item (Protected Route)
app.post("/inventoryAdd", (req, res) => {
  const {
    location,
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  } = req.body.inputs || {};

  if (!location || location.trim() === "") {
    return res.status(400).json({ error: "Location field cannot be blank." });
  }

  if (!validLocations.includes(location)) {
    return res.status(400).json({ error: "Location Does Not Exist" });
  }

  const newItem = {
    location: location.toUpperCase(),
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  };

  FreezerModel.create(newItem)
    .then((createdItem) => res.status(201).json(createdItem))
    .catch((err) =>
      res
        .status(500)
        .json({ error: "An error occurred while adding the item." })
    );
});

// Find inventory item (Protected Route)
app.post("/inventoryFind", (req, res) => {
  const {
    location,
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  } = req.body.inputs || {};

  const query = {};
  if (location) query.location = location.toUpperCase();
  if (lot) query.lot = lot;
  if (vendor) query.vendor = vendor;
  if (brand) query.brand = brand;
  if (species) query.species = species;
  if (description) query.description = description;
  if (grade) query.grade = grade;
  if (quantity) query.quantity = quantity;
  if (weight) query.weight = weight;
  if (packdate) query.packdate = packdate;
  if (temp) query.temp = temp;
  if (est) query.est = est;

  FreezerModel.find(query)
    .then((items) => {
      if (items.length > 0) {
        res.json(items);
      } else {
        res.status(404).json({ error: "No Items Found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the items." })
    );
});

// Update inventory item (Protected Route)
app.post("/inventoryUpdate", (req, res) => {
  const {
    location,
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
    currentItem,
  } = req.body.updateInputs || {};

  const filter = currentItem;
  if (!filter || location !== filter.location){
    return res.status(400).json({
      error: "Set the Item you wish to Update.",
    });
  }
  
  if (!location) {
    return res.status(400).json({
      
      error: "Location cannot be empty. Specify criteria to update an item.",
    });
  }

  const update = {
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  };

  const options = { new: true };

  FreezerModel.findOneAndUpdate(filter, update, options)
    .then((item) => {
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: "No Items Found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: "An Error occurred while Updating the Item." })
    );
});

// Remove inventory item (Protected Route)
app.post("/inventoryRemove", (req, res) => {
  const {
    location,
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  } = req.body.currentItem || {};

  const filter = {
    location,
    lot,
    vendor,
    brand,
    species,
    description,
    grade,
    quantity,
    weight,
    packdate,
    temp,
    est,
  };

  console.log("filter:",filter)
  if (!location || location.trim() === "") {
    return res.status(400).json({ error: "Location field cannot be blank." });
  }

  FreezerModel.findOne(filter)
    .then((item) => {
      if (item) {
        return FreezerModel.deleteOne(filter)
          .then(() =>
            res.status(200).json({ message: "Item Successfully Deleted." })
          )
          .catch((err) =>
            res
              .status(500)
              .json({ error: "An Error occurred while Removing the Item." })
          );
      } else {
        res.status(404).json({ error: "No Items Found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: "An Error occurred while Removing the Item." })
    );
});

app.post("/verifyLocation", (req, res) => {
  const location = req.body.location;
  if (!validLocations.includes(location)) {
    return res.status(400).json({ error: "Location Does Not Exist" });
  }
  return res.status(200).json({ message: "Locations Verified." })

})



// ----------------- User Routes -----------------

// User login (Generates JWT)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ username: email })
    .then((user) => {
      if (user && user.password === password) {
        // Generate JWT
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
          expiresIn: "1min", // Token expiration time
        });
        res.json({ message: "Success", token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch((err) => res.status(500).json({ error: "Internal Server Error" }));
});

// User signup
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  const newUser = {
    username: email,
    password: password,
  };

  UserModel.create(newUser)
    .then((user) => res.json(user))
    .catch((err) => res.status(500).json({ error: "Error creating user" }));
});

// Protected route for homepage
app.get("/", verifyToken, (req, res) => {
  res.json({ message: "Welcome to the protected homepage" });
});

// ----------------- Server -----------------
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
