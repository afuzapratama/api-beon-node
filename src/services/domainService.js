const net = require('net');

const whoisServers = {
    // TLD Generik Umum (gTLD)
    'com': 'whois.verisign-grs.com',
    'net': 'whois.verisign-grs.com',
    'org': 'whois.pir.org',
    'info': 'whois.afilias.net',
    'biz': 'whois.biz',
    'mobi': 'whois.dotmobi.mobi',
    'pro': 'whois.afilias.net',
    'name': 'whois.nic.name',
    'aero': 'whois.aero',
    'asia': 'whois.nic.asia',
    'cat': 'whois.nic.cat',
    'coop': 'whois.nic.coop',
    'jobs': 'whois.nic.jobs',
    'museum': 'whois.nic.museum',
    'tel': 'whois.nic.tel',
    'travel': 'whois.nic.travel',
    'xxx': 'whois.nic.xxx',

    // TLD Generik Baru (New gTLD)
    'xyz': 'whois.nic.xyz',
    'app': 'whois.nic.google',
    'dev': 'whois.nic.google',
    'club': 'whois.nic.club',
    'online': 'whois.nic.online',
    'site': 'whois.nic.site',
    'tech': 'whois.nic.tech',
    'store': 'whois.nic.store',
    'shop': 'whois.nic.shop',
    'cloud': 'whois.nic.cloud',
    'blog': 'whois.nic.blog',

    // TLD Negara (ccTLD)
    'id': 'whois.id',          // Indonesia
    'ac': 'whois.nic.ac',
    'ag': 'whois.nic.ag',
    'au': 'whois.auda.org.au', // Australia
    'be': 'whois.dns.be',
    'br': 'whois.registro.br', // Brazil
    'ca': 'whois.cira.ca',     // Kanada
    'cc': 'whois.nic.cc',
    'cn': 'whois.cnnic.cn',    // China
    'co': 'whois.nic.co',
    'de': 'whois.denic.de',    // Jerman
    'eu': 'whois.eu',
    'fr': 'whois.nic.fr',      // Prancis
    'gg': 'whois.gg',
    'hk': 'whois.hkirc.hk',    // Hong Kong
    'ie': 'whois.weare.ie',
    'in': 'whois.registry.in', // India
    'io': 'whois.nic.io',
    'it': 'whois.nic.it',
    'jp': 'whois.jprs.jp',     // Jepang
    'kr': 'whois.kr',          // Korea Selatan
    'me': 'whois.nic.me',
    'my': 'whois.mynic.my',    // Malaysia
    'nu': 'whois.iis.nu',
    'nz': 'whois.anyname.nz',
    'pl': 'whois.dns.pl',
    'ru': 'whois.tcinet.ru',   // Rusia
    'sg': 'whois.sgnic.sg',    // Singapura
    'sh': 'whois.nic.sh',
    'th': 'whois.thnic.co.th', // Thailand
    'tk': 'whois.dot.tk',

    'tv': 'whois.nic.tv',
    'tw': 'whois.twnic.net.tw',// Taiwan
    'uk': 'whois.nic.uk',      // Inggris
    'us': 'whois.nic.us',      // Amerika Serikat
    'vc': 'whois.nic.vc',
    'ws': 'whois.website.ws',
};

function checkDomain(domain) {
    return new Promise((resolve, reject) => {
        if (!domain) {
            return resolve({ status: 'error', message: 'Nama domain tidak valid.' });
        }

        const tld = domain.split('.').pop().toLowerCase();
        const whoisServer = whoisServers[tld];

        if (!whoisServer) {
            return resolve({
                status: 'error',
                message: `Server WHOIS untuk ekstensi .${tld} tidak ditemukan.`
            });
        }

        const client = new net.Socket();
        let response = '';

        client.connect(43, whoisServer, () => {
            client.write(domain + '\r\n');
        });

        client.on('data', (data) => {
            response += data.toString();
        });

        client.on('close', () => {
            const isAvailable = isDomainAvailable(response);
            resolve({
                status: 'success',
                domain: domain,
                is_available: isAvailable,
                whois_response: response
            });
        });

        client.on('error', (err) => {
            resolve({
                status: 'error',
                message: `Gagal terhubung ke server WHOIS: ${err.message}`
            });
        });

        client.setTimeout(10000);
        client.on('timeout', () => {
            client.destroy();
            resolve({
                status: 'error',
                message: 'Koneksi ke server WHOIS timeout.'
            });
        });
    });
}

function isDomainAvailable(whoisData) {
    if (!whoisData) return false;
    
    const lowerData = whoisData.toLowerCase();
    
    const notFoundMarkers = [
        'no match for',
        'not found',
        'domain not found',
        'no data found',
        'has not been registered',
        'is available for registration',
        'status: free',
        'no entries found'
    ];

    for (const marker of notFoundMarkers) {
        if (lowerData.includes(marker)) {
            return true;
        }
    }
    
    return false;
}

module.exports = {
    checkDomain
};
