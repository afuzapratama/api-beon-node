const axios = require('axios');
const geoService = require('./geoService');

async function isIpInCidr(ip, cidr) {
    const { IPv4, IPv6 } = require('ipaddr.js');
    
    try {
        const parsedIp = ip.includes(':') ? IPv6.parse(ip) : IPv4.parse(ip);
        const cidrParts = cidr.split('/');
        const range = ip.includes(':') ? IPv6.parseCIDR(cidr) : IPv4.parseCIDR(cidr);
        
        return parsedIp.match(range);
    } catch (e) {
        return false;
    }
}

// Simple CIDR check without external lib for now to avoid extra deps if possible, 
// but ipaddr.js is standard. I'll use a simple implementation or install ipaddr.js.
// Actually, I'll use a simple implementation for IPv4 and maybe skip IPv6 complexity or use a lib.
// The PHP code implements it manually. I can port that.

function ipInCIDR(ip, cidr) {
    const [subnet, mask] = cidr.split('/');
    if (!subnet || !mask) return false;

    // IPv4 only for this simple implementation, or use a library for robust check.
    // The PHP code handles both by splitting by ':' and doing hex conversion.
    // I'll use the 'ipaddr.js' library if I can, but I didn't add it to package.json.
    // I'll add 'ipaddr.js' to package.json later or use a simple manual check for now.
    // Let's port the PHP logic which is generic enough.
    
    const subnetParts = subnet.split(subnet.includes(':') ? ':' : '.');
    const ipParts = ip.split(ip.includes(':') ? ':' : '.');
    
    // This manual port is tricky because of IPv6 compression (::).
    // PHP's explode might handle it if full, but usually it needs expansion.
    // The PHP code provided:
    /*
    $subnetParts = explode(':', $subnet);
    $ipParts = explode(':', $ip);
    ...
    */
    // This PHP code seems to assume IPv6 format (hex parts) or maybe it's just for IPv6?
    // "ipInCIDR($ip, $cidr)"
    // If it's IPv4, it might fail with that PHP code unless it converts to hex?
    // Wait, the PHP code splits by ':' so it looks like it expects IPv6 or mapped IPv4.
    // But Google/Bing have IPv4 ranges too.
    
    // To be safe and professional, I will use `ip-range-check` or `ipaddr.js`.
    // I'll add `ipaddr.js` to package.json.
    return false; 
}

async function checkCrawler(ip) {
    // Get Geo Data first
    const geoData = await geoService.getGeoData(ip);
    
    // Fetch Google and Bing ranges
    const [googleRes, bingRes] = await Promise.all([
        axios.get('https://developers.google.com/search/apis/ipranges/googlebot.json').catch(() => ({ data: { prefixes: [] } })),
        axios.get('https://www.bing.com/toolbox/bingbot.json').catch(() => ({ data: { prefixes: [] } }))
    ]);

    const googlePrefixes = googleRes.data.prefixes || [];
    const bingPrefixes = bingRes.data.prefixes || [];
    
    const combined = [...googlePrefixes, ...bingPrefixes];
    
    let botDetected = false;
    
    // We need a proper CIDR checker.
    // I'll use a helper function using 'ipaddr.js' which I will install.
    const ipaddr = require('ipaddr.js');

    for (const prefix of combined) {
        const cidr = prefix.ipv4Prefix || prefix.ipv6Prefix;
        if (!cidr) continue;

        try {
            const addr = ipaddr.parse(ip);
            const range = ipaddr.parseCIDR(cidr);
            
            if (addr.kind() === range[0].kind() && addr.match(range)) {
                botDetected = true;
                break;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    return {
        status: 'Success', // Assuming success if we got here
        ip: ip,
        country: geoData.cityData?.country?.names?.en || '',
        country_code: geoData.cityData?.country?.iso_code || '',
        isp: geoData.asnData?.autonomous_system_organization || '',
        bot: botDetected ? "YES" : "NO",
        service: 'Beon Panel'
    };
}

module.exports = {
    checkCrawler
};
