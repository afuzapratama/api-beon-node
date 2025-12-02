const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debug() {
    const uri = process.env.MONGODB_URI;
    console.log("Connecting to:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password
    
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected successfully.");

        const db = client.db('jp');
        console.log("Using database: jp");

        // List collections
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        // Check jppostals
        const collection = db.collection('jppostals');
        const count = await collection.countDocuments();
        console.log(`Documents in 'jppostals': ${count}`);

        if (count > 0) {
            // Fetch one document to see structure
            const doc = await collection.findOne({});
            console.log("Sample document:", JSON.stringify(doc, null, 2));

            // Try to find the specific postal code
            const searchCode = "0600000";
            console.log(`Searching for postalCode: "${searchCode}"`);
            const found = await collection.findOne({ postalCode: searchCode });
            console.log("Found specific document:", found ? "YES" : "NO");
            
            if (!found) {
                // Try regex search to see if there are hidden chars
                console.log("Trying regex search...");
                const regexFound = await collection.findOne({ postalCode: { $regex: "0600000" } });
                console.log("Found with regex:", regexFound ? JSON.stringify(regexFound, null, 2) : "NO");
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

debug();
