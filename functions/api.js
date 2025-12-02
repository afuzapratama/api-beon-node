const serverless = require('serverless-http');
const app = require('../src/app');
const { connectMongo } = require('../src/config/database');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Ensure database connection
    await connectMongo();
    return await handler(event, context);
};
