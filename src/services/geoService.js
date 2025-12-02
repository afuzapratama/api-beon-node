const maxmind = require('maxmind');
const path = require('path');

let cityLookup = null;
let asnLookup = null;

const dataDir = path.join(__dirname, '../../data');

async function initGeo() {
    if (!cityLookup) {
        cityLookup = await maxmind.open(path.join(dataDir, 'GeoLite2-City.mmdb'));
    }
    if (!asnLookup) {
        asnLookup = await maxmind.open(path.join(dataDir, 'GeoLite2-ASN.mmdb'));
    }
}

async function getGeoData(ip) {
    if (!cityLookup || !asnLookup) {
        await initGeo();
    }

    if (!maxmind.validate(ip)) {
        throw new Error('Invalid IP Address format');
    }

    const cityData = cityLookup.get(ip);
    const asnData = asnLookup.get(ip);

    return {
        ip,
        cityData,
        asnData
    };
}

module.exports = {
    getGeoData
};
