const axios = require('axios');
const geoService = require('./geoService');

async function checkIpQuality(ip, userAgent, language) {
    const apiKey = process.env.IPQS_API_KEY;

    if (!ip) {
        throw new Error('Missing IP parameter');
    }

    // Get Geo Data for the response
    const geoData = await geoService.getGeoData(ip);
    const countryName = geoData.cityData?.country?.names?.en || '';

    const params = {
        user_agent: userAgent || '',
        user_language: language || '',
        strictness: 1,
        allow_public_access_points: 'true',
        lighter_penalties: 'false'
    };

    const url = `https://www.ipqualityscore.com/api/json/ip/${apiKey}/${ip}`;

    try {
        const response = await axios.get(url, { params });
        const result = response.data;

        if (result.success === false) {
             throw new Error(result.message || 'API Error');
        }

        // Check if required keys exist (as per PHP code)
        // PHP: if (isset($result['host'], $result['message'], $result['country_code'], $result['ISP'], $result['bot_status'], $result['fraud_score']))
        
        // We can be a bit more lenient or strict. Let's follow the PHP logic of constructing the response.
        
        const bot = result.bot_status === true ? 'YES' : 'NO';

        return {
            status: result.message,
            ip: ip,
            host: result.host,
            country: countryName, // PHP uses local geo data for country name
            code_country: result.country_code,
            isp: result.ISP,
            bot: bot,
            fraud: result.fraud_score,
            service: 'Beon Panel'
        };

    } catch (error) {
        console.error("IPQS Error:", error.message);
        throw new Error('Invalid API response or connection error');
    }
}

module.exports = {
    checkIpQuality
};
