
// B"H
/**
 * @file FirestoreBridge.js
 * @description
 * "He establishes the world so it shall not be moved."
 * 
 * The bridge is the connector between the void of our local disk and the 
 * light of the Firestore cloud. We have synchronized the constructor 
 * defaults to use `(default)` as the database ID. 
 * 
 * This is the standard garment for a new Firestore project. By speaking 
 * this name, we ensure the RESTful whispers of our Chariot reach the 
 * correct destination in the Google API hierarchy.
 */

const HttpRequest = require("../network/HttpRequest.js");
const UrlBuilder = require("../network/UrlBuilder.js");
const FirestoreValueConverter = require("./FirestoreValueConverter.js");

class FirestoreBridge {
    /**
     * @constructor
     * @param {string} projectId 
     * @param {Object} authStrategy 
     * @param {string} [databaseId="(default)"] - Standard Firestore default ID.
     */
    constructor(projectId, authStrategy, databaseId = "(default)") {
        this.projectId = projectId;
        this.authStrategy = authStrategy;
        this.databaseId = databaseId;
        this.baseUrl = `https://firestore.googleapis.com`;
        this.apiRoot = `/v1/projects/${projectId}/databases/${databaseId}/documents`;
    }

    /**
     * @method _send
     * @private
     * @description Sends raw HTTP/HTTPS pulses through the network Kav.
     */
    async _send(method, docPath, body = null) {
        const authParam = await this.authStrategy.getAuthQueryString();
        const fullInternalPath = `${this.apiRoot}/${docPath}`;
        
        const urlParams = UrlBuilder.build(
            this.baseUrl, 
            fullInternalPath, 
            authParam, 
            "", 
            { addJsonExtension: false }
        );

        const headers = { "Content-Type": "application/json" };
        const response = await HttpRequest.send({
            hostname: urlParams.hostname,
            path: urlParams.path,
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (response.statusCode >= 400) {
            if (response.statusCode === 404 && method === "GET") return null;

            /**
             * B"H: Returning the raw, unadulterated cry of the server.
             */
            throw new Error(response.body);
        }

        return response.body ? JSON.parse(response.body) : null;
    }

    async getDocument(path) {
        const res = await this._send("GET", path);
        return FirestoreValueConverter.fromDocumentFields(res);
    }

    async writeDocument(path, data) {
        const fields = FirestoreValueConverter.toDocumentFields(data);
        return await this._send("PATCH", path, fields);
    }

    async deleteDocument(path) {
        return await this._send("DELETE", path);
    }

    async listDocuments(collectionPath) {
        const res = await this._send("GET", collectionPath);
        if (!res || !res.documents) return [];
        return res.documents;
    }
}

module.exports = FirestoreBridge;
