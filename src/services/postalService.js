const { getMongoDb } = require('../config/database');

async function getPostalFromMongo(postalCode) {
    const db = getMongoDb();
    // Based on your screenshot, the collection name is 'postalCode', not 'jppostals'
    const collection = db.collection('postalCode');
    
    console.log(`[PostalService] Searching for: "${postalCode}" (Type: ${typeof postalCode})`);

    // Try exact match (String)
    let result = await collection.findOne({ postalCode: postalCode });
    console.log("[PostalService] Result (String):", result ? "Found" : "Not Found");

    // If not found, try as Integer (common issue with imported data)
    if (!result && !isNaN(postalCode)) {
        const postalInt = parseInt(postalCode, 10);
        console.log(`[PostalService] Searching for: ${postalInt} (Type: Number)`);
        result = await collection.findOne({ postalCode: postalInt });
        console.log("[PostalService] Result (Number):", result ? "Found" : "Not Found");
    }

    return result;
}

module.exports = {
    getPostalFromMongo
};
