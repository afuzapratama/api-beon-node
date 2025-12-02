const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

const denyListPath = path.join(__dirname, '../../data/dennylist.txt');
let denyList = new Set();

function loadDenyList() {
    try {
        const content = fs.readFileSync(denyListPath, 'utf-8');
        const domains = content.split('\n').map(d => d.trim().replace(/\r/g, '')).filter(d => d);
        denyList = new Set(domains);
        console.log(`Loaded ${denyList.size} disposable domains.`);
    } catch (error) {
        console.error("Failed to load deny list:", error);
    }
}

loadDenyList();

function isDisposable(email) {
    const domain = email.split('@')[1];
    if (!domain) return false;
    return denyList.has(domain);
}

async function checkMx(email) {
    const domain = email.split('@')[1];
    if (!domain) return false;
    try {
        const addresses = await dns.resolveMx(domain);
        return addresses && addresses.length > 0;
    } catch (error) {
        return false;
    }
}

async function verifyEmail(email) {
    // 1. Validate format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { status: 'Invalid', code: 400 };
    }

    // 2. Check disposable
    // Note: PHP code says: if (is_disposable_email($email)) { ... }
    // Wait, let's check the PHP logic again.
    // if ($core->is_disposable_email($email)) { if ($validmail->check($email)) ... } else { ... 'Disposable' }
    // The PHP function is_disposable_email returns TRUE if it IS valid (not disposable)?
    // Let's check BEON_CORE.php
    
    /*
    public function is_disposable_email($email){
        $disposable = new EmailChecker(new Adapter\ArrayAdapter($this->dennyList));
        return $disposable->isValid($email);
    }
    */
    // EmailChecker->isValid($email) usually returns true if it is NOT disposable.
    // So if is_disposable_email returns true, it means it is NOT disposable (it is valid).
    // So my logic should be: if NOT disposable, then check MX.
    
    if (isDisposable(email)) {
         return { status: 'Disposable', code: 200 };
    }

    // 3. Check MX (SMTP check replacement)
    const mxExists = await checkMx(email);
    if (mxExists) {
        return { status: 'Valid', code: 200 };
    } else {
        return { status: 'Bounce', code: 200 };
    }
}

module.exports = {
    verifyEmail
};
