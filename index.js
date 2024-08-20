const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const UserModel = require("./models/User")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://shawn:Liu123456@atlascluster.frneldu.mongodb.net/AdamsFoods")
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error', err));

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


