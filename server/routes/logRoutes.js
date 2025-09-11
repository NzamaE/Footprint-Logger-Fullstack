const express = require('express');
const connectToDatabase = require('../models/db')


const router = express.Router();


//Register
router.get("/logs", async (req, res) => {
try{

 const theDb = await connectToDatabase();


 const logs = theDb.collection('Logs').find({}).toArray();

   if(logs){
     
      res.json(logs);

   }else{
    res.json("No logs found");
   }
  




}catch(error){

    res.status(400).send("Bad Request");

}

});


module.exports = router;

