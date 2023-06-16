const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

// mongodb connection

const username = process.env.DB_USER;
const password = process.env.DB_PASS;


const uri = `mongodb+srv://${username}:${password}@cluster0.6euurqe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("carTOYS").collection("users");
    const carsCollection = client.db("carTOYS").collection("cars");

    // user api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // cars api
    app.get("/cars", async (req, res) => {
      const page = parseInt(req.query.page) || 1; 
      const limit = 20; 
      const startIndex = (page - 1) * limit;

      const result = await carsCollection.find().skip(startIndex).limit(limit).toArray();
      res.send(result);
    });

    app.get("/cars/toy/:id",async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await carsCollection.findOne(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy-server-is running");
});

app.listen(port, () => {
  console.log(`toy-server is running on ${port}`);
});
