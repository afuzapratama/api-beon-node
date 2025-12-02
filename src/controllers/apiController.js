const geoService = require('../services/geoService');
const userAgentService = require('../services/userAgentService');
const emailService = require('../services/emailService');
const postalService = require('../services/postalService');
const domainService = require('../services/domainService');
const domainAnalyzerService = require('../services/domainAnalyzerService');
const crawlerService = require('../services/crawlerService');
const cardService = require('../services/cardService');
const binService = require('../services/binService');
const blockerService = require('../services/blockerService');

// Geolocation
async function getGeolocation(req, res) {
    try {
        const ip = req.query.ip;
        if (!ip) {
            return res.status(400).json({ status: 'error', message: 'IP Address parameter is missing' });
        }

        const data = await geoService.getGeoData(ip);
        
        // Format response to match PHP
        const response = {
            status: 'Success',
            ip: data.ip,
            service: 'Beon Panel'
        };

        if (data.cityData) {
            const c = data.cityData;
            if (c.country && c.country.names) response.country = c.country.names.en;
            if (c.country) response.country_code = c.country.iso_code;
            if (c.city && c.city.names) response.city = c.city.names.en;
            if (c.continent && c.continent.names) response.continent = c.continent.names.en;
            if (c.location) {
                response.timezone = c.location.time_zone;
                response.latitude = c.location.latitude;
                response.longitude = c.location.longitude;
            }
            if (c.postal) response.postal = c.postal.code;
            if (c.subdivisions && c.subdivisions[0] && c.subdivisions[0].names) {
                response.subdivisi = c.subdivisions[0].names.en;
            }
        }

        if (data.asnData) {
            response.isp = data.asnData.autonomous_system_organization;
        }

        res.json(response);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// User Agent
async function getUserAgent(req, res) {
    try {
        const ua = req.query.ua;
        if (!ua) {
            return res.status(400).json({ error: 'Missing ua parameter' });
        }

        const result = userAgentService.parseUserAgent(ua);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Bounce / Email Verification
async function verifyEmail(req, res) {
    try {
        let email = req.query.email;
        if (!email) {
            return res.status(400).json({ code: 400, status: 'error', email_status: 'Required' });
        }

        email = email.toLowerCase().trim();
        
        const result = await emailService.verifyEmail(email);
        
        const response = {
            code: result.code,
            status: result.code === 200 ? 'ok' : 'error',
            email: email,
            email_status: result.status
        };

        res.json(response);

    } catch (error) {
        res.status(500).json({ code: 500, status: 'error', message: error.message });
    }
}

// Postal Code (JP)
async function getPostalJp(req, res) {
    try {
        let code = req.query.code;
        if (!code) {
            return res.status(400).json({ error: 'Postal code parameter is empty' });
        }

        // Sanitize
        code = code.replace(/[- 〒+]/g, '').replace(/\D/g, '');

        if (code.length !== 7) {
            return res.status(422).json({ error: 'Postal code must be 7 digits' });
        }

        // Use MongoDB for Postal Code Lookup
        let result = await postalService.getPostalFromMongo(code);

        if (!result) {
            return res.status(404).json({ error: 'Postal code not found' });
        }

        res.json({
            postalCode: result.postalCode,
            prefectureKana: result.prefectureKana,
            cityKana: result.cityKana,
            townKana: result.townKana,
            prefecture: result.prefecture,
            city: result.city,
            town: result.town
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Domain Check
async function checkDomain(req, res) {
    try {
        const name = req.query.name;
        if (!name) {
            return res.json({ status: 'error', message: 'Parameter "name" tidak boleh kosong.' });
        }

        const result = await domainService.checkDomain(name);
        res.json(result);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// Domain Analysis (WHOIS, DNS, SSL)
async function analyzeDomain(req, res) {
    try {
        const domain = req.query.domain;
        if (!domain) {
            return res.status(400).json({ status: 'error', message: 'Parameter "domain" tidak boleh kosong.' });
        }

        const result = await domainAnalyzerService.analyzeDomain(domain);
        res.json(result);

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// Crawler / Blockers
async function checkCrawler(req, res) {
    try {
        const ip = req.query.ip;
        if (!ip) {
            return res.status(400).json({ error: 'IP Address parameter is missing' });
        }

        const result = await crawlerService.checkCrawler(ip);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Card Validation
async function validateCard(req, res) {
    try {
        const cardNumber = req.query.card_number;
        if (!cardNumber) {
            return res.status(400).json({ 
                status: "error",
                valid: false,
                message: "Parameter 'card_number' wajib diisi."
            });
        }

        const result = await cardService.validateCard(cardNumber);
        res.json(result);

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            status: "error",
            valid: false,
            message: error.message
        });
    }
}

// BIN Lookup
async function getBinLookup(req, res) {
    try {
        const bin = req.query.ccnumb;
        const ip = req.query.ip;

        if (!bin || !ip) {
            return res.status(400).json({ error: 'Missing ccnumb or ip parameter' });
        }

        const result = await binService.lookupBin(bin, ip);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// IP Quality Check
async function checkIpQuality(req, res) {
    try {
        const ip = req.query.ip;
        const ua = req.query.ua;
        const language = req.query.language;

        if (!ip) {
            return res.status(400).json({ error: 'Missing IP parameter' });
        }

        const result = await blockerService.checkIpQuality(ip, ua, language);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getGeolocation,
    getUserAgent,
    verifyEmail,
    getPostalJp,
    checkDomain,
    analyzeDomain,
    checkCrawler,
    validateCard,
    getBinLookup,
    checkIpQuality
};
