require('dotenv').config();
const express = require('express');


const app = express();
const PORT = process.env.SERVER_PORT; 


const filePATH = "C:/Users/Nzama/Desktop/Footprint-Logger-Fullstack/client/dist";


//Creating my express middleware to serve static files
const renderMiddleware = express.static(filePATH);

//Mounting my middleware
app.use(renderMiddleware);



app.get("/", (req,res)=>{




});

app.listen(PORT, ()=>{

console.log("server running on port :"+ PORT);

});