const axios = require('axios');

async function lookupBin(bin, ip) {
    const userId = process.env.NEUTRINO_USER_ID;
    const apiKey = process.env.NEUTRINO_API_KEY;

    if (!bin || !ip) {
        throw new Error('Missing bin or ip parameter');
    }

    try {
        const response = await axios.post('https://neutrinoapi.net/bin-lookup', 
            new URLSearchParams({
                'bin-number': bin + '4', // The PHP code appends '4' for some reason? "bin-number=' . $bin . '4"
                'customer-ip': ip
            }), 
            {
                headers: {
                    'User-ID': userId,
                    'API-Key': apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const data = response.data;

        return {
            status: data.valid,
            card: {
                'card-number': data['bin-number'],
                'brand': data['card-brand'],
                'type': data['card-type'],
                'category': data['card-category'],
                'bank': data['issuer'],
                'website': data['issuer-website'],
                'country': data['country'],
                'countrycode': data['country-code'],
                'phone': data['issuer-phone'],
                'countrycode3': data['country-code3'],
                'is-commercial': data['is-commercial'],
            },
            ip: {
                'ip-blacklist': data['ip-blocklists'],
                'ip-city': data['ip-city'],
                'ip-region': data['ip-region'],
                'ip-country': data['ip-country'],
                'ip-country-code': data['ip-country-code'],
                'ip-country-code3': data['ip-country-code3'],
                'ip-matches-bin': data['ip-matches-bin'],
            }
        };

    } catch (error) {
        console.error("BIN Lookup Error:", error.message);
        throw new Error('BIN Lookup failed');
    }
}

module.exports = {
    lookupBin
};
