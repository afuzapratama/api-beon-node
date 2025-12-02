const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Client
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let mongoDbInstance = null;

async function connectMongo() {
    try {
        await mongoClient.connect();
        console.log("Connected to MongoDB");
        mongoDbInstance = mongoClient.db('jp'); // Default DB from connection string
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // Don't exit process, just log error, maybe mongo is optional or down
    }
}

function getMongoDb() {
    if (!mongoDbInstance) {
        throw new Error("MongoDB not initialized. Call connectMongo first.");
    }
    return mongoDbInstance;
}

module.exports = {
    connectMongo,
    getMongoDb
};
