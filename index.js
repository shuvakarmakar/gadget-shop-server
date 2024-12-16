const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// token verification
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({ message: "No Token" })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (err, decoded) => {
        if (err) {
            return res.send({ message: "Invalid Token" })
        }
        req.decoded = decoded;
        next();
    })
}

// verify seller
const verifySelller = async (req, res, next) => {
    const email = req.body.sellerEmail;
    const query = { email: email };
    const user = await userCollection.findOne(query);

    if (user?.role !== "seller") {
        return res.status(403).send({ message: "Forbidden Access" });
    }
    next();
};



// mongodb
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

        // get Users
        app.get("/user/:email", async (req, res) => {
            const query = { email: req.params.email }
            const result = await userCollection.findOne(query);
            // if (user) {
            //     return res.send({message: "No User Found"})
            // }
            res.send(result);
        })

        // Post Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "User already exists" })
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        // add product
        app.post("/add-products", verifyJWT, verifySelller, async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        })

        // get product

        app.get("/all-products",  async (req, res) => {
            // name searching
            // sort by price 
            // filter by category 
            // filter by brand 
            
        })



    } finally {
        // await client.close();
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
