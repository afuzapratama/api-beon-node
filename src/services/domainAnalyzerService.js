const whois = require('whois');
const dns = require('dns').promises;
const sslChecker = require('ssl-checker');

function getWhois(domain) {
    return new Promise((resolve, reject) => {
        whois.lookup(domain, (err, data) => {
            if (err) {
                resolve({ error: err.message });
            } else {
                resolve(data);
            }
        });
    });
}

function parseWhoisAvailability(whoisData) {
    if (!whoisData || typeof whoisData !== 'string') return false;
    
    const notFoundMarkers = [
        'No match for',
        'NOT FOUND',
        'Domain not found',
        'No Data Found',
        'has not been registered',
        'is available for registration'
    ];

    for (const marker of notFoundMarkers) {
        if (whoisData.includes(marker)) {
            return true;
        }
    }
    return false;
}

async function getDnsRecords(domain) {
    const records = {};
    try {
        records.A = await dns.resolve4(domain).catch(() => []);
        records.AAAA = await dns.resolve6(domain).catch(() => []);
        records.MX = await dns.resolveMx(domain).catch(() => []);
        records.TXT = await dns.resolveTxt(domain).catch(() => []);
        records.NS = await dns.resolveNs(domain).catch(() => []);
    } catch (e) {
        // Ignore DNS errors
    }
    return records;
}

async function getSslInfo(domain) {
    try {
        return await sslChecker(domain);
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

async function analyzeDomain(domain) {
    // 1. WHOIS
    const whoisRaw = await getWhois(domain);
    const isAvailable = parseWhoisAvailability(whoisRaw);

    // 2. DNS (Only if registered, usually)
    let dnsRecords = {};
    let sslInfo = null;

    if (!isAvailable) {
        dnsRecords = await getDnsRecords(domain);
        sslInfo = await getSslInfo(domain);
    }

    return {
        domain: domain,
        availability: {
            status: isAvailable ? 'AVAILABLE' : 'REGISTERED',
            is_available: isAvailable
        },
        dns: dnsRecords,
        ssl: sslInfo,
        whois_raw: whoisRaw // Optional: truncate if too long
    };
}

module.exports = {
    analyzeDomain
};
