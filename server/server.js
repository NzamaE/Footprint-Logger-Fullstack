const express = require('express');
const {query, validationResult} = require('express-validator');




const userRoutes = require('./routes/users');



const app = express();

//Mount, your request will pass here and then go to the "userRoutes"
app.use("/", userRoutes);


app.get("/hello",query('person').notEmpty() ,(req,res)=>{

const results = validationResult(req);

if (results.isEmpty()){
 const person = req.query.person;
    res.send('Hello,'+ person);

}


res.send({errors: results.array()});




});



app.listen(5000, ()=>{

    console.log("I am running on port 5000...");
})