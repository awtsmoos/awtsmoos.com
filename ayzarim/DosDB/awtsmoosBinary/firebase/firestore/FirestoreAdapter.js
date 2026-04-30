
// B"H
/**
 * @file FirestoreAdapter.js
 * @description
 * This is the Chariot (Merkavah) that allows DosDB to ride upon the Firestore cloud.
 * It coordinates the path mapping, the value conversion, and the bridge execution.
 * 
 * Whether the database is MongoDB-compatible or standard Firestore, this adapter 
 * treats the data with the same holiness, ensuring its essence is preserved 
 * across the digital void.
 */

const FirestoreBridge = require("./FirestoreBridge.js");
const FirestorePathHelper = require("./FirestorePathHelper.js");
const AuthStrategyMap = require("../auth/AuthStrategyMap.js");
const FirebaseConfigValidator = require("../config/FirebaseConfigValidator.js");

class FirestoreAdapter {
    constructor(rawConfig) {
        const config = FirebaseConfigValidator.validate(rawConfig);
        const projectId = FirestorePathHelper.getProjectId(config);
        
        if (!projectId) {
            throw new Error("B\"H: Project ID is required for Firestore operations.");
        }

        const authStrategy = AuthStrategyMap.getStrategy(config);
        this.bridge = new FirestoreBridge(projectId, authStrategy, config.databaseId);
    }

    async read(localPath) {
        const fsPath = FirestorePathHelper.formatDocumentPath(localPath);
        return await this.bridge.getDocument(fsPath);
    }

    async write(localPath, value) {
        const fsPath = FirestorePathHelper.formatDocumentPath(localPath);
        return await this.bridge.writeDocument(fsPath, value);
    }

    async update(localPath, value) {
        // In Firestore REST, PATCH behaves as an update.
        return await this.write(localPath, value);
    }

    async remove(localPath) {
        const fsPath = FirestorePathHelper.formatDocumentPath(localPath);
        return await this.bridge.deleteDocument(fsPath);
    }

    async exists(localPath) {
        const data = await this.read(localPath);
        return data !== null;
    }

    async keys(localPath) {
        // Firestore keys are the document IDs in a collection.
        // We list documents in the collection corresponding to localPath.
        const fsPath = localPath.replace(/\/+$/, "");
        const docs = await this.bridge.listDocuments(fsPath);
        return docs.map(d => {
            const parts = d.name.split('/');
            return parts[parts.length - 1];
        });
    }
}

module.exports = FirestoreAdapter;
