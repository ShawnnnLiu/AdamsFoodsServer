const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const UserModel = require("./models/User")
const FreezerModel = require("./models/Freezer")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://tester:testing12345@atlascluster.frneldu.mongodb.net/AdamsFoods")

//mongoose.connect("mongodb+srv://shawn:Liu123456@atlascluster.frneldu.mongodb.net/AdamsFoods")
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error', err));


app.post('/updateSubmit', (req, res) => {
    const inputs = req.body.inputs;
  
    // Perform whatever processing you need with the inputs
    console.log('Received inputs:', inputs);
  
    // Here you could save the inputs to a database, or perform some other logic
    // For this example, let's just log the inputs and send a success response
  
    // Assume you have some processing logic here...

    // FreezerModel.create(newUser)
    // .then(user => res.json(user))
    // .catch(err => res.status(500).json(err));  // It's better to return a 500 status code on errors

    
    // If processing is successful:
    res.json(inputs);
    
    // If there was an error:
    // res.status(500).json("Error");
  });

  // inventoryFind
//   app.post('/inventoryFind', (req, res) => {
//     const inputs = req.body.inputs;
  
//     // Perform whatever processing you need with the inputs
//     console.log('Received inputs:', inputs);

//     FreezerModel.findAll(inputs)
//     .then(user => res.json(user))
//     .catch(err => res.status(500).json(err));

    
//     // If processing is successful:
//     res.json(inputs);
//     res.status(500).json("Error");
//   });
  


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


