
// B"H
/**
 * @file FirebaseAdapter.js
 * @description
 * The Chariot for the Realtime Database. It takes the normalized config 
 * and ensures the light flows into the large JSON tree of the RTDB.
 */

const FirebaseConfigValidator = require("./config/FirebaseConfigValidator.js");
const AuthStrategyMap = require("./auth/AuthStrategyMap.js");
const PathMapper = require("./path/PathMapper.js");
const ToFirebase = require("./serialization/ToFirebase.js");
const FromFirebase = require("./serialization/FromFirebase.js");
const FirebaseRealtimeBridge = require("./operations/FirebaseRealtimeBridge.js");
const HttpMethods = require("./operations/HttpMethodsMap.js");

class FirebaseAdapter {
    /**
     * @constructor
     * @param {Object} rawConfig - Raw or Normalized config.
     */
    constructor(rawConfig) {
        // Re-validate just in case it's called directly
        const config = FirebaseConfigValidator.validate(rawConfig);
        
        if (!config.databaseURL) {
            throw new Error("B\"H: databaseURL is required for Realtime Database operations.");
        }

        const authStrategy = AuthStrategyMap.getStrategy(config);
        this.bridge = new FirebaseRealtimeBridge(config.databaseURL, authStrategy);
        this.pathMapper = new PathMapper(config.rootNamespace);
    }

    async read(localPath) {
        const fbPath = this.pathMapper.toFirebase(localPath);
        const rawData = await this.bridge.execute(fbPath, HttpMethods.READ);
        return FromFirebase.deserialize(rawData);
    }

    async write(localPath, value) {
        const fbPath = this.pathMapper.toFirebase(localPath);
        const serialized = ToFirebase.serialize(value);
        return await this.bridge.execute(fbPath, HttpMethods.WRITE, serialized);
    }

    async update(localPath, value) {
        const fbPath = this.pathMapper.toFirebase(localPath);
        const serialized = ToFirebase.serialize(value);
        return await this.bridge.execute(fbPath, HttpMethods.UPDATE, serialized);
    }

    async remove(localPath) {
        const fbPath = this.pathMapper.toFirebase(localPath);
        return await this.bridge.execute(fbPath, HttpMethods.REMOVE);
    }

    async exists(localPath) {
        const data = await this.read(localPath);
        return data !== null;
    }
    
    async keys(localPath) {
        const fbPath = this.pathMapper.toFirebase(localPath);
        const shallowData = await this.bridge.execute(fbPath, HttpMethods.READ, undefined, "shallow=true");
        if (!shallowData || typeof shallowData !== "object") return [];
        const KeySanitizer = require("./path/KeySanitizer.js");
        return Object.keys(shallowData).map(k => KeySanitizer.unsanitize(k));
    }
}

module.exports = FirebaseAdapter;
