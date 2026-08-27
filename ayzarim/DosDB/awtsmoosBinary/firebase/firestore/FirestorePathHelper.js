
// B"H
/**
 * @file FirestorePathHelper.js
 * @description
 * "The stone that the builders rejected has become the chief cornerstone."
 * 
 * We have learned from the void. Firestore is protective of its "Internal Names." 
 * By using double underscores (`__`), we were accidentally reaching into the 
 * "Holy of Holies" reserved only for the system's own metadata. 
 * 
 * We have shifted the name of our directory-representative document to 
 * `awtsmoos_index`. This satisfies the alternating hierarchy of 
 * `Collection -> Document -> Collection` while remaining within the 
 * boundaries of permitted identity in the Firestore realm.
 */

class FirestorePathHelper {
    /**
     * @method formatDocumentPath
     * @description Normalizes a path for Firestore.
     * @param {string} localPath - E.g., 'users/profiles/admin'
     * @returns {string} The path formatted for Firestore's document endpoint.
     */
    static formatDocumentPath(localPath) {
        if (!localPath || localPath === "/") return "";
        
        let segments = localPath.split('/').filter(Boolean);
        
        // Firestore paths must terminate in a document.
        // Paths are Collection -> Document -> Collection -> Document.
        // If segments.length is ODD, it refers to a Collection.
        // If segments.length is EVEN, it refers to a Document.
        
        if (segments.length % 2 !== 0) {
            /**
             * B"H: We use 'awtsmoos_index' instead of '__awtsmoos_index__' 
             * because IDs matching __.*__ are reserved by Firestore.
             */
            segments.push("awtsmoos_index");
        }

        return segments.join('/');
    }

    /**
     * @method getProjectId
     * @description Extracts project ID from the service account or config.
     * @param {Object} config 
     * @returns {string}
     */
    static getProjectId(config) {
        return config.project_id || (config.serviceAccount && config.serviceAccount.project_id);
    }
}

module.exports = FirestorePathHelper;
