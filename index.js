const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const UserModel = require("./models/User")
const FreezerModel = require("./models/Freezer")

const app = express()
app.use(express.json())
app.use(cors())

//mongoose.connect("mongodb+srv://tester:testing12345@atlascluster.frneldu.mongodb.net/AdamsFoods")

mongoose.connect("mongodb+srv://anthony:1Anthony@atlascluster.frneldu.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster")
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error', err));


app.post('/updateSubmit', (req, res) => {
    const inputs = req.body.inputs;
  
    // Perform whatever processing you need with the inputs
    console.log('Received inputs:', inputs);

    res.json(inputs);
  });

  // inventoryFind
  app.post('/inventoryFind', (req, res) => {
    const { location, lot, vendor, brand, species, description, grade, quantity, weight, packdate, temp, est } = req.body.inputs || {};

    const query = {};

    if (location) query.location = location;
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

    console.log('+++++++++++++++++++++++++++++++++++');
    console.log('Query:', query);
    console.log('Searching...');

    FreezerModel.find(query)
        .then(items => {
            if (items.length > 0) {
                console.log('----------------------');
                console.log('Found items:', items);
                res.json(items);
            } else {
                // Send a 404 status if no items are found
                console.log('No items found');
                res.status(404).json({ message: 'No items found' });
            }
        })
        .catch(err => {
            // Log the error and send a 500 status if something goes wrong
            console.error('Error during database operation:', err);
            res.status(500).json({ error: 'An error occurred while retrieving the items.' });
        });
});

  


app.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    UserModel.findOne({ username: email })
    .then(user => {
        if (user) {
            if(user.password === password){
                res.json("Success");
            } else {
                res.json("Incorrect password");
            }
        } else {
            res.json("Email not found");
        }
    })
    .catch(err => {
        console.error('Error occurred:', err);
        res.status(500).json('Internal Server Error');
    });
});

app.post("/signup", (req, res) => {
    const { email, password } = req.body;

    // Create a new user object with the correct structure
    const newUser = {
        username: email,  // Map email to the username field
        password: password
    };

    UserModel.create(newUser)
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err));  // It's better to return a 500 status code on errors
});


  app.listen(3001, () => {
    console.log("server is running")
  })