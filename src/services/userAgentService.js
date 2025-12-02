const DeviceDetector = require('device-detector-js');

const deviceDetector = new DeviceDetector();

function parseUserAgent(userAgent) {
    if (!userAgent) {
        throw new Error('User Agent string is required');
    }

    const result = deviceDetector.parse(userAgent);
    
    // Format to match the PHP output structure roughly, or better
    const isBot = result.bot !== null;
    
    return {
        clientInfo: result.client,
        osInfo: result.os,
        device: result.device.type,
        brand: result.device.brand,
        model: result.device.model,
        isBot: isBot ? 'YES' : 'NO',
        botName: isBot ? result.bot.name : '',
        type: result.device.type,
        user_agent: userAgent
    };
}

module.exports = {
    parseUserAgent
};
