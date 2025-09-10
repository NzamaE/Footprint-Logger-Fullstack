const express = require('express');
const {query, validationResult} = require('express-validator');

const app = express();


const userRoutes = require('./routes/users');
const authRoutes = require('./routes/authRoutes');


app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Mount, your request will pass here and then go to the "userRoutes"
app.use("/", userRoutes);
app.use("/user",authRoutes);



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