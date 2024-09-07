
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5555 ;
const app = express() ;

app.use(cors({
  origin : [
    'http://localhost:5173',
    'https://school-management-de5a5.web.app',
    'https://school-management-de5a5.firebaseapp.com'
  ],
  credentials : true ,
})) ;
app.use(express.json()) ;
require("dotenv").config() ;

const uri = `mongodb+srv://rahat495:${process.env.DB_PASS}@cluster0.w0yjihf.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("jobTask1").collection("users") ;
    const productsCollection = client.db("jobTask1").collection("products") ;
    const cartsCollection = client.db("jobTask1").collection("carts") ;

    app.get('/login' , async (req , res) => {
      const {email , pass} = req.query ;
      const isvalidEmail = await usersCollection.findOne({email}) ;
      if(isvalidEmail?.email){
        if(pass === isvalidEmail?.pass){
          await usersCollection.updateOne({_id : new ObjectId(isvalidEmail?._id)} , { $set : { isLogin : true } }) ;
          return res.send({message : "login success" , status : true}) ;
        }
        else{
          return res.send({message : "invalid password" , status : false}) ;
        }
      }
      else{
        return res.send({message : "invalid email" , status : false}) ;
      }
    })

    app.get('/cartItemCount' , async (req , res) => {
      const {email} = req.query ;
      const data = await cartsCollection.find({email}).toArray() ;
      const count = data?.reduce((acc , data) => acc+ data?.numberOfAdd , 0)
      res.send({count}) ;
    })

    app.get('/cartItems' , async (req , res) => {
      const {email} = req.query ;
      const cartItems = await cartsCollection.find({email}).toArray() ;
      res.send(cartItems) ;
    })

    app.post('/signUp' , async (req , res) => {
      const {fName , lName , email , pass} = req.body ;
      const isAxist = await usersCollection.findOne({email}) ;
      if(!isAxist?.email){
          const result = await usersCollection.insertOne({fName , lName , email , pass , isLogin : true}) ;
          return res.send(result) ;
      }
      else{
          return res.send({message : "already axist" , status : false}) ;
      }
    })

    app.post('/addToCart' , async (req , res) => {
      const data = req.body ;
      const isAxistingItem = await cartsCollection.findOne({id : data?.id}) ;
      if(isAxistingItem?.id){
        if(isAxistingItem?.id === data?.id){
          const update = await cartsCollection.updateOne({_id : isAxistingItem?._id} , { $set : { numberOfAdd : isAxistingItem?.numberOfAdd + 1 } })
          res.send(update) ;
        }
        else{
          const addToCart = await cartsCollection.insertOne(data) ;
          res.send(addToCart) ;
        }
      }
      else if(isAxistingItem?.id !== data?.id){
        const addToCart = await cartsCollection.insertOne(data) ;
        res.send(addToCart) ;
      }
    })

    app.put('/userFromGoogle' , async (req , res) => {
      const data = req.body ;
      const isAxist = await usersCollection.findOne({email : data?.email}) ;
      if(!isAxist?.email){
          const result = await usersCollection.insertOne(data) ;
          return res.send(result) ;
      }
      else{
          return res.send({message : "already axist" , status : false}) ;
      }
    })

    app.patch('/logOut' , async (req , res) => {
      const {email} = req.body ;
      const updateIsLogin = await usersCollection.updateOne({email} , { $set : { isLogin : false } }) ;
      res.send(updateIsLogin) ;
    })

    app.patch('/addItem' , async (req , res) => {
      const data = req.body ;
      const result = await cartsCollection.updateOne({_id : new ObjectId(data?._id)} , { $set : { numberOfAdd : data?.numberOfAdd + 1 } }) ;
      res.send(result) ;
    })

    app.patch('/removeItem' , async (req , res) => {
      const data = req.body ;
      const result = await cartsCollection.updateOne({_id : new ObjectId(data?._id)} , { $set : { numberOfAdd : data?.numberOfAdd - 1 } }) ;
      res.send(result) ;
    })

    app.delete('/deleteItem' , async (req , res) => {
      const {id} = req.query ;
      const result = await cartsCollection.deleteOne({_id : new ObjectId(id)}) ;
      res.send(result) ;
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/' , (req , res) => {
    res.send("server is running !")
})

app.listen(port , () => {
    console.log(`the server is running at port ${port}`);
})
