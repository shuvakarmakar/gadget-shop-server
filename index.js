const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json()); // Correctly apply middleware

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gu0z5kw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const userCollection = client.db('gadgetShop').collection('users');
const productCollection = client.db('gadgetShop').collection('products');

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// JWT Authentication
app.post('/authentication', (req, res) => {
    const userEmail = req.body;

    if (!userEmail || !userEmail.email) {
        return res.status(400).send({ error: "Email is required" });
    }

    const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, { expiresIn: '10d' });
    res.send({ token });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
