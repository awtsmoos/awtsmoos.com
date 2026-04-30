
// B"H
/**
 * @file JWTBuilder.js
 * @description
 * "The eyes of the Lord are in every place." 
 * 
 * To enter the Firestore realm, the soul's signature (JWT) must possess the correct 
 * "vision" (Scopes). Your previous attempt failed because the scope was too narrow—
 * it only looked at the Realtime Database. We are broadening the Kav to include 
 * the 'datastore' and 'cloud-platform' domains, allowing the access token to 
 * manifest with full authority in the Firestore cloud.
 */

const crypto = require("crypto");

const base64UrlReplacements = {
    '+': '-',
    '/': '_',
    '=': ''
};

class JWTBuilder {
    /**
     * @method build
     * @description Generates the signed JWT with expanded Firestore scopes.
     */
    static build(email, privateKey) {
        const now = Math.floor(Date.now() / 1000);
        
        const header = {
            alg: "RS256",
            typ: "JWT"
        };
        
        const payload = {
            iss: email,
            sub: email,
            // B"H: Broadening the scopes to include datastore (Firestore) and cloud-platform
            scope: [
                "https://www.googleapis.com/auth/firebase.database",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/datastore",
                "https://www.googleapis.com/auth/cloud-platform"
            ].join(" "),
            aud: "https://oauth2.googleapis.com/token",
            iat: now,
            exp: now + 3600
        };

        const encodedHeader = JWTBuilder._base64urlEncode(JSON.stringify(header));
        const encodedPayload = JWTBuilder._base64urlEncode(JSON.stringify(payload));
        const signingInput = `${encodedHeader}.${encodedPayload}`;

        const signature = JWTBuilder._sign(signingInput, privateKey);

        return `${signingInput}.${signature}`;
    }

    static _base64urlEncode(str) {
        let base64 = Buffer.from(str).toString("base64");
        for (const [char, replacement] of Object.entries(base64UrlReplacements)) {
            base64 = base64.split(char).join(replacement);
        }
        return base64;
    }

    static _sign(input, privateKey) {
        const signer = crypto.createSign("RSA-SHA256");
        signer.update(input);
        let signature = signer.sign(privateKey, "base64");
        
        for (const [char, replacement] of Object.entries(base64UrlReplacements)) {
            signature = signature.split(char).join(replacement);
        }
        return signature;
    }
}

module.exports = JWTBuilder;
