require('dotenv').config();
const {MongoClient} = require('mongodb');



const envUrl = process.env.MONGODB_URL;
console.log(envUrl);

const client = new MongoClient(envUrl);


let datbaseIntance = "";




async function connectToDatabase() {

  if(datbaseIntance){

    return datbaseIntance;
  }


try{

    //Connect to the database server and wait for the response before you continue
    await client.connect();
  console.log("Successfully connected to the database");
    //Get your data from the database server
    datbaseIntance = client.db('User');

    //Get your collection from your database
    //const userCollection = dbInstance.collection('Users');

    //Retreive all users
    //const users = await userCollection.find({}).toArray();


     //console.log(users);

     return datbaseIntance;

}catch(error){

    console.log("Could not connect to the database due to this error :"+ error)
    throw error;
};





};



module.exports = connectToDatabase;















