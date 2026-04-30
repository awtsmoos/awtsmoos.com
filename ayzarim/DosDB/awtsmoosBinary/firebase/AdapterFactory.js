
// B"H
/**
 * @file AdapterFactory.js
 * @description
 * The point of Tzimtzum where the infinite choice becomes a finite action.
 * If the user gives us a databaseURL, we flow into the Realtime Database.
 * If they give us a Service Account but no URL, we default to the mighty 
 * Firestore. 
 * 
 * The factory now consumes the normalized config, where the choice has 
 * already been discerned by the Validator.
 */

const FirebaseAdapter = require("./FirebaseAdapter.js"); // RTDB
const FirestoreAdapter = require("./firestore/FirestoreAdapter.js");

class AdapterFactory {
    /**
     * @method create
     * @description Manifests the correct adapter based on normalized config.
     * @param {Object} config - The validated and normalized config object.
     * @returns {Object} The chosen Adapter Chariot.
     */
    static create(config) {
        // The validator has already set 'type' for us based on available fields.
        const type = config.type || "firestore";
        
        const adapters = {
            "rtdb": () => new FirebaseAdapter(config),
            "firebase": () => new FirebaseAdapter(config),
            "firestore": () => new FirestoreAdapter(config)
        };

        const creator = adapters[type] || adapters["firestore"];
        return creator();
    }
}

module.exports = AdapterFactory;
