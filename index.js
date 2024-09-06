const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const UserModel = require("./models/User")
const FreezerModel = require("./models/Freezer")

const app = express()
app.use(express.json())
app.use(cors())


mongoose.connect("mongodb+srv://anthony:1Anthony@atlascluster.frneldu.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster")
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error', err));


//inventoryAdd
app.post('/inventoryAdd', (req, res) => {
    const { location, lot, vendor, brand, species, description, grade, quantity, weight, packdate, temp, est } = req.body.inputs || {};

    const filter = { location };
    const newItem = { location, lot, vendor, brand, species, description, grade, quantity, weight, packdate, temp, est };

    console.log('+++++++++++++++++++++++++++++++++++');
    console.log('Filter:', filter);
    console.log('New Item:', newItem);

    if (!location || location.trim() === '') {
        return res.status(400).json({ error: 'Location field cannot be blank.' });
    }

    FreezerModel.findOne(filter)
        .then(item => {
            if (item) {
                return res.status(404).json({ error: 'Item Already Exists. Update instead.' });
            } else {
                return FreezerModel.create(newItem)
                    .then(createdItem => {
                        console.log('Item added:', createdItem);
                        res.status(201).json(createdItem);
                    })
                    .catch(err => {
                        console.error('Error during database operation:', err);
                        res.status(500).json({ error: 'An error occurred while adding the item.' });
                    });
            }
        })
        .catch(err => {
            console.error('Error during database operation:', err);
            res.status(500).json({ error: 'An error occurred while checking for the item.' });
        });
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

app.post('/inventoryUpdate', (req, res) => {
    const { location, lot, vendor, brand, species, description, grade, quantity, weight, packdate, temp, est } = req.body.inputs || {};
    const filter = { location };

    console.log('filter', filter.location);

    if (!filter.location) {
        // If the location is blank or undefined, send a 400 response and return
        console.log('Blank filter detected. No update performed.');
        return res.status(400).json({ error: 'Location cannot be empty. Specify criteria to update an item.' });
    }

    const update = { lot, vendor, brand, species, description, grade, quantity, weight, packdate, temp, est };
    const options = { new: true };

    console.log('+++++++++++++++++++++++++++++++++++');
    console.log('Update:', update);
    console.log('Updating...');

    FreezerModel.findOneAndUpdate(filter, update, options)
        .then(item => {
            if (item) {
                console.log(item);
                res.status(200).json(item);
            } else {
                // Send a 404 status if no items are found
                console.log('No items found');
                res.status(404).json({ error: 'No items found' });
            }
        })
        .catch(err => {
            // Log the error and send a 500 status if something goes wrong
            console.error('Error during database operation:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'An error occurred while updating the item.' });
            }
        });
});


app.post("/inventoryRemove", (req, res) => {
    const { location} = req.body.inputs || {};
    const filter = { location };

    console.log('+++++++++++++++++++++++++++++++++++');
    console.log('Filter:', filter);

    if (!location || location.trim() === '') {
        return res.status(400).json({ error: 'Location field cannot be blank.' });
    }

    FreezerModel.findOne(filter)
    .then(item => {
        if (item) {
            return FreezerModel.deleteOne(filter)
                .then(() => {
                    console.log('Item successfully deleted.');
                    res.status(200).json({ message: 'Item successfully deleted.' });
                })
                .catch(err => {
                    console.error('Error during delete operation:', err);
                    res.status(500).json({ error: 'An error occurred while deleting the item.' });
                });

            
        } else {
            console.log('No items found');
            res.status(404).json({ error: 'No items found' });
        }

    })
    .catch(err => {
        console.error('Error during database operation:', err);
        res.status(500).json({ error: 'An error occurred while deleting the items.' });
    });

});


  
//-----------------------USER SECTION---------------------------------------------------------------------------------

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