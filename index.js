const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());

// user:doctordb
// pass: nwdnzSVVDcnRzkke


console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iz6re5a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if(!authorization){
//       return res.status(401).send({error: true, message: 'unauthorized access'});
//   }
//   const token = authorization.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
//       if(err){
//           return res.status(401).send({error: true, message: 'unauthorized access'})
//       }
//       req.decoded = decoded;
//       next();
//   })
// }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const checkCollection = client.db('carDoctor').collection('checkout')

    // //jwt
    // app.post('/jwt', (req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
    //   expiresIn:'1h' });
    //   console.log(token)
    //   res.send({token});
    // })


    //services to routes
    app.get('/services', async(req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };


      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    })

    app.get('/checkout', async (req, res) => {
    
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await checkCollection.find(query).toArray();
      res.send(result);
  })


    //CheckOut
    app.post('/checkout', async(req, res) => {
      const checkout = req.body;
      console.log(checkout);
      const result = await checkCollection.insertOne(checkout);
      res.send(result);
    });

    app.patch('/checkout/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body; 
      console.log(updatedBooking);

      const updateDoc = {
        $set: {
         status: updatedBooking.status
        },
      };
      const result = await checkCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/checkout/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await checkCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send("doctor is running")
});

app.listen(port, () => {
    console.log(`Car doctor server is running on port ${port}`)
});