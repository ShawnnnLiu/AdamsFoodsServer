const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User");
const FreezerModel = require("./models/Freezer");

const app = express();
const SECRET_KEY = "your_secret_key"; // Store securely (e.g., environment variable)

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://shawn:Liu123456@atlascluster.frneldu.mongodb.net/AdamsFoods"
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Connection error", err));

// mongoose
//   .connect(
//     "mongodb+srv://anthony:1Anthony@atlascluster.frneldu.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster"
//   )
//   .then(() => console.log("Connected to MongoDB Atlas"))
//   .catch((err) => console.error("Connection error", err));

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
app.post("/inventoryAdd", verifyToken, (req, res) => {
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
      res.status(500).json({ error: "An error occurred while adding the item." })
    );
});

// Find inventory item (Protected Route)
app.post("/inventoryFind", verifyToken, (req, res) => {
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
        res.status(404).json({ message: "No items found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: "An error occurred while retrieving the items." })
    );
});

// Update inventory item (Protected Route)
app.post("/inventoryUpdate", verifyToken, (req, res) => {
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

  const filter = { location };
  if (!filter.location) {
    return res
      .status(400)
      .json({
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
        res.status(404).json({ error: "No items found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ error: "An error occurred while updating the item." })
    );
});

// Remove inventory item (Protected Route)
app.post("/inventoryRemove", verifyToken, (req, res) => {
  const { location } = req.body.inputs || {};
  const filter = { location };

  if (!location || location.trim() === "") {
    return res.status(400).json({ error: "Location field cannot be blank." });
  }

  FreezerModel.findOne(filter)
    .then((item) => {
      if (item) {
        return FreezerModel.deleteOne(filter)
          .then(() => res.status(200).json({ message: "Item successfully deleted." }))
          .catch((err) =>
            res
              .status(500)
              .json({ error: "An error occurred while deleting the item." })
          );
      } else {
        res.status(404).json({ error: "No items found" });
      }
    })
    .catch((err) =>
      res.status(500).json({ error: "An error occurred while deleting the items." })
    );
});

// ----------------- User Routes -----------------

// User login (Generates JWT)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ username: email })
    .then((user) => {
      if (user && user.password === password) {
        // Generate JWT
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
          expiresIn: "5min", // Token expiration time
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
