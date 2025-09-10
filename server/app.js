const express = require('express');


const app = express();
const PORT = 3000; 


const PATH = "C:/Users/Nzama/Desktop/Footprint-Logger-Fullstack/client/dist";


//Creating my express middleware to serve static files
const renderMiddleware = express.static(PATH);

//Mounting my middleware
app.use(renderMiddleware);



app.get("/", (req,res)=>{




});

app.listen(PORT, ()=>{

console.log("server running on port :"+ PORT);

});