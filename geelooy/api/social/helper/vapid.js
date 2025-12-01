//B"H
/**
 * B"H
 * Zero-Dependency VAPID Helper
 * Signs JWTs using native Node.js crypto
 */
const crypto = require('crypto');
const https = require('https');


const VAPID_KEYS = {
    publicKey: "BDAf39EwkWkpJFykJOGxnhzgaMI9XQF6qHGKH6CHaIGT9xxP5N-a85iTjpXD_33RPXU5r0t5ES5njXzzFGBnpF4",
    privateKey: "9Wz4UadrHlcZK5ezouKdadReJNPkjNSeiu6t9U0bDU4", 
    subject: "mailto:admin@awtsmoos.com" 
};

function toBase64Url(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(audience) {
    const header = { typ: "JWT", alg: "ES256" };
    const claim = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
        sub: VAPID_KEYS.subject
    };

    const data = toBase64Url(JSON.stringify(header)) + "." + toBase64Url(JSON.stringify(claim));
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    
    // Create the DER signature
    const signature = sign.sign({
        key: Buffer.from(VAPID_KEYS.privateKey, 'base64url'),
        format: 'pem',
        type: 'pkcs8',
        dsaEncoding: 'ieee-p1363' // Important for WebCrypto compatibility
    });

    return data + "." + signature.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function sendWakeUpSignal(subscription) {
    if(!subscription || !subscription.endpoint) return;

    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.hostname}`;
    const token = signToken(audience);

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `vapid t=${token}, k=${VAPID_KEYS.publicKey}`,
            'TTL': '60',
            // No Content-Encoding: aes128gcm because payload is empty!
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode === 201) resolve(true);
            else resolve(false); // e.g. 410 Gone (User unsubscribed)
        });
        req.on('error', reject);
        req.end(); // Empty body
    });
}

module.exports = { sendWakeUpSignal, VAPID_KEYS };