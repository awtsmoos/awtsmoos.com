//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbDosBridgeBase
 * @description
 * DosDB family bridge base: construction, reads, existence and single writes.
 */

const fs = require('fs');
const { AwtsmoosDbFsBridge, getSharedBridge } = require('./awtsmoosDbFsBridge.js');
const {
	familyDbFiles,
	familyForPath,
	legacyFallbackAllowed,
	normalizeSocialPath,
	pathWithDefaultExtension,
	possibleFilePaths,
	removeJsonExtension
} = require('./awtsmoosDbFamilies.js');
const { objectKeys, readBridgeFile, serializeValue } = require('./awtsmoosDbValueCodec.js');

class AwtsmoosDbDosBridgeBase {
	constructor({ dbFile = '', dbFiles = null, packedDir = '', heichelId = 'ikar', legacyDb = null }) {
		this.legacyDb = legacyDb;
		this.directory = legacyDb?.directory || '';
		const files = dbFiles || (packedDir ? familyDbFiles({ packedDir, heichelId }) : { series: dbFile });
		this.bridges = {};
		for (const [family, file] of Object.entries(files)) {
			if (file && fs.existsSync(file)) this.bridges[family] = getSharedBridge(file);
		}
	}

	close() {
		for (const bridge of Object.values(this.bridges)) bridge.close();
	}

	async getObjectKeys(id) {
		const found = this._findExisting(id);
		if (found?.dir) return found.bridge.ls(found.path).map(removeJsonExtension);
		if (found?.file) return objectKeys(found.bridge, found.path);
		if (!legacyFallbackAllowed(id)) return [];
		return this.legacyDb?.getObjectKeys ? this.legacyDb.getObjectKeys(id) : [];
	}

	async get(id, options = {}) {
		const found = this._findExisting(id);
		if (found?.dir) return found.bridge.ls(found.path).map(removeJsonExtension);
		if (found?.file) return readBridgeFile(found.bridge, found.path, options);
		if (!legacyFallbackAllowed(id)) return undefined;
		return this.legacyDb?.get ? this.legacyDb.get(id, options) : undefined;
	}

	async read(id, options = {}) {
		return this.get(id, options);
	}

	// B"H 2026-10-11 (import-speed): cheap existence check — stat only,
	// no value read/deserialization. For the import's airtight
	// idempotency skip path (which only needs "does the native record
	// exist"), this is far cheaper than get() on large posts.
	async exists(id) {
		try {
			return !!this._findExisting(id);
		} catch (_) {
			return false;
		}
	}

	async write(id, value) {
		const virtualPath = pathWithDefaultExtension(id);
		const bridge = this._bridgeForWrite(virtualPath);
		if (bridge) return bridge.writeBuffer(virtualPath, serializeValue(value, virtualPath), { logicalPath: virtualPath });
		if (!legacyFallbackAllowed(id)) return false;
		return this.legacyDb?.write ? this.legacyDb.write(id, value) : false;
	}

}

module.exports = {
	AwtsmoosDbDosBridgeBase
};
