const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ouateedemloic:wXWbcesw7Fpp9mEL@olympicapi.ibg9v.mongodb.net/?retryWrites=true&w=majority&appName=OlympicApi";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db('sample_mflix');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}

async function getMovies(limit) {
    const db = await connectToDatabase();
    return db.collection('movies').find().limit(limit).toArray();
}

module.exports = { getMovies };
