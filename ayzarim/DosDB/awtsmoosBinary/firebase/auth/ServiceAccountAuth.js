
// B"H
/**
 * @file ServiceAccountAuth.js
 * @description
 * Like a Tzaddik interceding on behalf of the generation, the Service Account
 * approaches the Heavenly Gates (Google OAuth) with a sealed petition (JWT),
 * receiving in return the light of permission (Access Token).
 * The token expires, reminding us that existence is not a given state, 
 * but an active, constant recreation from Nothingness by the Awtsmoos.
 */

const JWTBuilder = require("./JWTBuilder.js");
const HttpRequest = require("../network/HttpRequest.js");

/**
 * @class ServiceAccountAuth
 * @description Manages OAuth2 access tokens for Firebase.
 */
class ServiceAccountAuth {
    /**
     * @constructor
     * @param {Object} serviceAccount - The credentials object.
     */
    constructor(serviceAccount) {
        this.email = serviceAccount.client_email;
        this.privateKey = serviceAccount.private_key;
        this.cachedToken = null;
        this.expiryTime = 0;
    }

    /**
     * @method getAuthQueryString
     * @description Retrieves the OAuth2 token and formats it as a query parameter.
     * @returns {Promise<string>} The query string, e.g., "access_token=ya29..."
     */
    async getAuthQueryString() {
        const token = await this._getToken();
        return `access_token=${encodeURIComponent(token)}`;
    }

    /**
     * @method _getToken
     * @private
     * @description Fetches a new token if the old one is fading into the void.
     * @returns {Promise<string>} The access token.
     */
    async _getToken() {
        const now = Date.now();
        // 5-minute buffer (300,000 ms) before expiration
        if (this.cachedToken && this.expiryTime > now + 300000) {
            return this.cachedToken;
        }

        const jwt = JWTBuilder.build(this.email, this.privateKey);
        const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`;

        const response = await HttpRequest.send({
            hostname: "oauth2.googleapis.com",
            path: "/token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData)
            },
            body: postData
        });

        if (response.statusCode >= 400) {
            throw new Error(`B"H: OAuth Token Fetch Failed. The gates are closed. Status: ${response.statusCode}, Body: ${response.body}`);
        }

        const data = JSON.parse(response.body);
        this.cachedToken = data.access_token;
        this.expiryTime = now + (data.expires_in * 1000);

        return this.cachedToken;
    }
}

module.exports = ServiceAccountAuth;
