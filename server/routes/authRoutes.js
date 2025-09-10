const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../models/db')

const router = express.Router();


//Register
router.post("/register", (req,res)=>{

console.log(req.body);
//req.body.name
//req.body.surname
//req.body.email
//req.body.role
//req.body.password




});





//Login
router.post("login",(req,res)=>{



});


