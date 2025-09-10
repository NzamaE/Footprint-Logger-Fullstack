const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../models/db')

const router = express.Router();


//Register
router.post("/register", async (req, res) => {


  const theDb = await connectToDatabase();

const user ={
name : req.body.name,
surname : req.body,
email : req.body.email,
role : req.body.role,
password : req.body.password 
}


  //  console.log(JSON.parse(req.body.name));
    console.log(JSON.stringify(user));     // e.g. "John"
    

    
    res.status(200).json({
        message: "User registered successfully",
        data: req.body
    });


});





//Login
router.post("login", (req, res) => {



});


module.exports = router;