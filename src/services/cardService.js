const axios = require('axios');

// Regex patterns for common card brands
const cardPatterns = {
    'VISA': /^4[0-9]{12}(?:[0-9]{3})?$/,
    'MASTERCARD': /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
    'AMEX': /^3[47][0-9]{13}$/,
    'DISCOVER': /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    'JCB': /^(?:2131|1800|35\d{3})\d{11}$/,
    'DINERS': /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    'UNIONPAY': /^(62|88)\d{14,17}$/
};

function getCardBrand(number) {
    for (const [brand, pattern] of Object.entries(cardPatterns)) {
        if (pattern.test(number)) {
            return brand;
        }
    }
    return 'UNKNOWN';
}

function isValidLuhn(number) {
    let sum = 0;
    const numDigits = number.length;
    const parity = numDigits % 2;

    for (let i = 0; i < numDigits; i++) {
        let digit = parseInt(number[i]);
        if (i % 2 === parity) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }

    return (sum % 10 === 0);
}

async function getBinMetadata(binPrefix) {
    // Use a more reliable public BIN lookup if possible, or stick to Stripe internal for now but handle errors gracefully
    // Note: Stripe internal API is not guaranteed to be stable.
    // Alternative: https://lookup.binlist.net/ (Rate limited) or similar free APIs.
    // For now, we keep the existing logic but maybe add a fallback or just return null.
    
    const publicKey = 'pk_live_51PAsTY17kyXyUa2phmlNNxMVZveCitKi69Y1b1VdSqOCZYrZqhGD32Y4rjbHH4WmRZcwJunH79Yge9u5l8MJ3eKs00GZJ9KUzO';
    const url = `https://api.stripe.com/edge-internal/card-metadata?bin_prefix=${binPrefix}&key=${publicKey}`;

    try {
        const response = await axios.get(url, { timeout: 5000 }); // Reduced timeout
        if (response.status !== 200 || !response.data) {
            return null;
        }
        
        const data = response.data.data;
        if (!data || data.length === 0) {
            return null;
        }

        return data[0];
    } catch (error) {
        // console.error("BIN Lookup Error:", error.message);
        return null;
    }
}

async function validateCard(cardNumber) {
    if (!cardNumber) {
        throw new Error("Parameter 'card_number' wajib diisi.");
    }

    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // 1. Basic Length Check
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
         return {
            status: "success",
            valid: false,
            message: "Panjang nomor kartu tidak valid.",
            luhn_valid: false,
            brand: 'UNKNOWN',
            type: 'UNKNOWN',
            country: 'UNKNOWN',
            issuer: 'UNKNOWN'
         };
    }

    // 2. Luhn Check
    const luhnValid = isValidLuhn(cleanNumber);
    if (!luhnValid) {
        return {
            status: "success",
            valid: false,
            message: "Nomor kartu tidak valid (Luhn check failed).",
            luhn_valid: false,
            brand: getCardBrand(cleanNumber), // Still try to detect brand
            type: 'UNKNOWN',
            country: 'UNKNOWN',
            issuer: 'UNKNOWN'
        };
    }

    // 3. Brand Detection (Regex)
    const detectedBrand = getCardBrand(cleanNumber);

    // 4. BIN Lookup (Metadata)
    const binPrefix = cleanNumber.substring(0, 6);
    let binMetadata = null;
    try {
        binMetadata = await getBinMetadata(binPrefix);
    } catch (e) {
        // Ignore BIN lookup errors, proceed with regex result
    }

    // Combine results
    const result = {
        status: "success",
        valid: true,
        brand: (binMetadata && binMetadata.brand) ? binMetadata.brand.toUpperCase() : detectedBrand,
        type: (binMetadata && binMetadata.funding) ? binMetadata.funding.toUpperCase() : 'UNKNOWN',
        country: (binMetadata && binMetadata.country) ? binMetadata.country : 'UNKNOWN',
        issuer: (binMetadata && binMetadata.bank) ? binMetadata.bank : 'UNKNOWN', // Stripe sometimes returns bank
        luhn_valid: true
    };

    return result;
}

async function validateCardAdvanced(cardNumber) {
    // Wrapper for validateCard but with more detailed error handling if needed
    // For now, validateCard is already quite advanced.
    return await validateCard(cardNumber);
}

module.exports = {
    validateCard,
    validateCardAdvanced
};
