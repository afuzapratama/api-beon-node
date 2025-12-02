const axios = require('axios');

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
    const publicKey = 'pk_live_51PAsTY17kyXyUa2phmlNNxMVZveCitKi69Y1b1VdSqOCZYrZqhGD32Y4rjbHH4WmRZcwJunH79Yge9u5l8MJ3eKs00GZJ9KUzO';
    const url = `https://api.stripe.com/edge-internal/card-metadata?bin_prefix=${binPrefix}&key=${publicKey}`;

    try {
        const response = await axios.get(url, { timeout: 10000 });
        if (response.status !== 200 || !response.data) {
            return null;
        }
        
        const data = response.data.data;
        if (!data || data.length === 0) {
            return null;
        }

        return data[0];
    } catch (error) {
        return null;
    }
}

async function validateCard(cardNumber) {
    if (!cardNumber) {
        throw new Error("Parameter 'card_number' wajib diisi.");
    }

    const cleanNumber = cardNumber.replace(/\D/g, '');
    const binPrefix = cleanNumber.substring(0, 6);

    const luhnValid = isValidLuhn(cleanNumber);
    let binMetadata = null;

    if (binPrefix.length >= 6) {
        binMetadata = await getBinMetadata(binPrefix);
    }

    if (luhnValid && binMetadata) {
        return {
            status: "success",
            valid: true,
            brand: (binMetadata.brand || 'UNKNOWN').toUpperCase(),
            type: (binMetadata.funding || 'UNKNOWN').toUpperCase(),
            country: binMetadata.country || 'N/A'
        };
    } else {
        const errorMessages = [];
        if (!luhnValid) errorMessages.push("Pengecekan Luhn gagal.");
        if (!binMetadata) errorMessages.push("BIN kartu tidak dikenali.");

        const error = new Error("Nomor kartu tidak valid. " + errorMessages.join(" "));
        error.status = 422;
        throw error;
    }
}

module.exports = {
    validateCard
};
