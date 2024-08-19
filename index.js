const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://shawn:Liu123456@atlascluster.frneldu.mongodb.net/AdamsFoods")


  app.listen(3001, () => {
    console.log("server is running")
  })