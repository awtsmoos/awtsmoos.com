
// B"H
/**
 * @file ContentAliyahPolicy.js
 * @chapter The Laws of Divine Redirection (Aliyah Policy)
 * @description
 * "Every spark knows its rightful place."
 * 
 * Firestore is restricted to sparks smaller than 1MiB (approx. 1,048,576 bytes).
 * If we try to stuff 1.4MB of `os.zip` into it, it will shatter the vessel.
 * 
 * The Awtsmoos created physical laws. We define the threshold: Any spark over 900KB 
 * is decreed a "Heavy Spark" and will instantly be diverted to the boundless expanse 
 * of Firebase Hosting, receiving a URL reference back in Firestore instead.
 */

const FirebaseHostingBridge = require("../hosting/FirebaseHostingBridge.js");
const AuthStrategyMap = require("../auth/AuthStrategyMap.js");

class ContentAliyahPolicy {
    /**
     * @static
     * @description Data threshold constants. Set slightly below 1MB to account for Firestore garment overhead.
     */
    static get THRESHOLDS() {
        return {
            MAX_FIRESTORE_SIZE: 900 * 1024 // 900 KB
        };
    }

    /**
     * @method discernDestination
     * @description Evaluates a file's physical size to determine its proper heavenly vessel.
     * @param {string} relativePath - The earthly name of the file.
     * @param {Buffer|string} content - The inner soul to measure.
     * @param {Object} config - Firebase configuration.
     * @param {Function} log - Tracker.
     * @returns {Promise<any>} The content to be saved to Firestore (could be the content itself, or a URL ref).
     */
    static async discernDestination(relativePath, content, config, log) {
        const size = Buffer.isBuffer(content) 
            ? content.length 
            : Buffer.byteLength(content.toString(), "utf8");
        
        if (size >= ContentAliyahPolicy.THRESHOLDS.MAX_FIRESTORE_SIZE) {
            log(`[LAW_TRIGGERED] B"H: Spark '${relativePath}' is immense (${size} bytes). Redirecting strictly to Hosting...`);
            return await ContentAliyahPolicy._elevateToHostingDirectly(relativePath, content, config, log);
        }

        // Return original matter to go to Firestore.
        return content;
    }

    /**
     * @method _elevateToHostingDirectly
     * @private
     * @description Executes the Hosting Bridge for heavy files.
     */
    static async _elevateToHostingDirectly(relativePath, content, config, log) {
        const projectId = config.project_id || (config.serviceAccount && config.serviceAccount.project_id);
        if (!projectId) throw new Error(`B"H: A project ID is required to access the Hosting realm.`);

        const authStrategy = AuthStrategyMap.getStrategy(config);
        const bridge = new FirebaseHostingBridge(projectId, authStrategy);

        const finalUrl = await bridge.deployHeavyFile(relativePath, content, log);

        // We return a "Vessel Reference" that will be safely placed inside Firestore
        // pointing humanity to the new Heavenly URL.
        return {
            _awtsmoosType: "external_reference",
            _source: "firebase_hosting",
            url: finalUrl,
            path: relativePath,
            size: Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content.toString(), "utf8"),
            syncedAt: new Date().toISOString()
        };
    }

    /**
     * @method wrapAsBinaryToBypassIndexing
     * @description Wraps text/JSON into a Base64 Bytes blob if Firestore index rejects it.
     */
    static wrapAsBinaryToBypassIndexing(content) {
        const data = Buffer.isBuffer(content) 
            ? content 
            : Buffer.from(typeof content === 'string' ? content : JSON.stringify(content), 'utf8');
        return { _awtsmoosForcedBinary: true, data };
    }
}

module.exports = ContentAliyahPolicy;
