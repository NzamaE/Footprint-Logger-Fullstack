const express = require('express');
const userRoutes = require('./routes/users');



const app = express();

//Mount, your request will pass here and then go to the "userRoutes"
app.use("/", userRoutes);






app.listen(5000, ()=>{

    console.log("I am running on port 5000...");
})