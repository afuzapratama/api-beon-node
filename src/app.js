const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectMongo } = require('./config/database');
const routes = require('./routes');
const rootRoute = require('./routes/root');

const app = express();
const PORT = process.env.PORT || 3000;

// Global JSON Prettify
app.set('json spaces', 4);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use('/api', rootRoute); // For the root /api endpoint

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
});

// Start Server
async function startServer() {
    await connectMongo();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = app;
