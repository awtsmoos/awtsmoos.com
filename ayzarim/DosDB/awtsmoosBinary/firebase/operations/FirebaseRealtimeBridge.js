
// B"H
/**
 * @file FirebaseRealtimeBridge.js
 * @description
 * Even the Realtime Database's large JSON tree requires safe paths. 
 * We have unified the URL building process. By delegating to the UrlBuilder 
 * and requesting the `.json` extension garment, we ensure every request 
 * is compliant and stable.
 */

const HttpRequest = require("../network/HttpRequest.js");
const UrlBuilder = require("../network/UrlBuilder.js");
const HttpMethods = require("./HttpMethodsMap.js");

class FirebaseRealtimeBridge {
    /**
     * @constructor
     * @param {string} databaseURL 
     * @param {Object} authStrategy 
     */
    constructor(databaseURL, authStrategy) {
        this.databaseURL = databaseURL;
        this.authStrategy = authStrategy;
    }

    /**
     * @method execute
     * @description Dispatches commands through a safely woven URL.
     */
    async execute(path, method, data = undefined, queryString = "") {
        const authParam = await this.authStrategy.getAuthQueryString();
        
        // Unified construction with .json extension required by RTDB
        const urlParams = UrlBuilder.build(
            this.databaseURL, 
            path, 
            authParam, 
            queryString, 
            { addJsonExtension: true }
        );
        
        const body = data !== undefined ? JSON.stringify(data) : undefined;
        const headers = body ? { "Content-Type": "application/json" } : {};

        const response = await HttpRequest.send({
            hostname: urlParams.hostname,
            path: urlParams.path,
            method: method,
            headers: headers,
            body: body
        });

        return this._handleResponse(response, method);
    }

    /**
     * @method _handleResponse
     * @private
     */
    _handleResponse(response, method) {
        if (response.statusCode >= 400) {
            let errInfo;
            try { errInfo = JSON.parse(response.body); } catch(e) { errInfo = response.body; }
            throw new Error(`B"H: Firebase rejected the plea (${response.statusCode}): ${JSON.stringify(errInfo)}`);
        }

        if (response.body === "null" || (response.body === "" && method === HttpMethods.REMOVE)) {
            return null;
        }

        try {
            return JSON.parse(response.body);
        } catch (e) {
            return response.body;
        }
    }
}

module.exports = FirebaseRealtimeBridge;
