const express = require('express');
const userDatabase = require('../models/db')

const router = express.Router();


router.get("/users", async (req,res)=>{
try{

     let database = await userDatabase();
     let users = await database.collection('Users').find({}).toArray();
      console.log(users);    

     res.send(users);




}catch(error){
  console.error("Failed to fetch users :"+ error);

  res.status(500).send({error:"failde to fetch users"});
}
  
   


});



module.exports = router;




