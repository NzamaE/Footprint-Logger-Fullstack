const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../models/db')

const router = express.Router();


//Register
router.post("/register", async (req, res) => {

    try{

    const theDb = await connectToDatabase();

    const user = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password
    }

    
    const response = await theDb.collection('Users').insertOne(user);

    console.log("Database insertion response:" + response);


    //  console.log(JSON.parse(req.body.name));
    console.log(JSON.stringify(user));     // e.g. "John"

    res.status(200).json({
        message: "User registered successfully",
        data: req.body
    });

    }catch(error){

       res.status(400).json({message : "Registration unsuccessful"});

    }
    


});





//Login
router.post("/login", async (req, res) => {

    try {


        const theDb = await connectToDatabase();
        const user = {

            email: req.body.email,
            password: req.body.password

        }

        const findUser = await theDb.collection('Users').findOne({ email: user.email });
    

            
      console.log("Database response"+findUser);


        if (findUser) {
           
       

            if (findUser.password === user.password) {

                res.status(200).json({ message: "Credintials match successfully" });
            } else {
                res.status(403).json({ message: "Incorrect password" });
            }
        }else{
              res.status(403).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Login unsuccessful");
        res.status(500).json("Internal server error:" + error);
    }


});


module.exports = router;