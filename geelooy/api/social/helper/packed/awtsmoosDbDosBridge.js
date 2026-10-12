// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosDbDosBridge
 * @description
 * The Awtsmoos joins DosDB calls to family-separated AwtsmoosDB vessels.
 * Modern rich comments are family-routed without touching any legacy comment sea.
 */
const fs = require('fs');
const { AwtsmoosDbFsBridge } = require('./awtsmoosDbFsBridge.js');
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

class AwtsmoosDbDosBridge {
	constructor({ dbFile = '', dbFiles = null, packedDir = '', heichelId = 'ikar', legacyDb = null }) {
		this.legacyDb = legacyDb;
		this.directory = legacyDb?.directory || '';
		const files = dbFiles || (packedDir ? familyDbFiles({ packedDir, heichelId }) : { series: dbFile });
		this.bridges = {};
		for (const [family, file] of Object.entries(files)) {
			if (file && fs.existsSync(file)) this.bridges[family] = new AwtsmoosDbFsBridge({ dbFile: file });
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

	// B"H 2026-10-11 (import-speed): BULK native write (design doc §3.1).
	// entries: [{ id, value }] or [{ id, buffer }] (pre-serialized Buffer).
	// Groups entries by family bridge; each bridge lands its share in ONE
	// fs transaction via writeManyBuffers — one round of per-file overhead
	// per 100–500 records instead of per record. Returns per-entry
	// { id, ok, bytes?, error? } in INPUT order. Entries with no native
	// bridge fall back to serial legacy writes. Serialization failures are
	// reported per entry, never thrown.
	async writeMany(entries) {
		const list = Array.isArray(entries) ? entries : [];
		const out = new Array(list.length);
		const byBridge = new Map();
		const serial = [];
		for (let i = 0; i < list.length; i++) {
			const entry = list[i] || {};
			const id = entry.id;
			const virtualPath = pathWithDefaultExtension(id);
			let buffer = entry.buffer;
			if (!Buffer.isBuffer(buffer)) {
				try {
					buffer = serializeValue(entry.value, virtualPath);
				} catch (e) {
					out[i] = { id, ok: false, error: 'SERIALIZE_FAILED: ' + ((e && e.message) || e) };
					continue;
				}
			}
			const bridge = this._bridgeForWrite(virtualPath);
			if (bridge) {
				let items = byBridge.get(bridge);
				if (!items) { items = []; byBridge.set(bridge, items); }
				// NOTE: writeManyBuffers entries are { virtualPath, value }.
				items.push({ idx: i, virtualPath, value: buffer });
			} else {
				serial.push({ idx: i, id, buffer });
			}
		}
		for (const [bridge, items] of byBridge) {
			let res;
			try {
				res = bridge.writeManyBuffers(items);
			} catch (e) {
				const msg = (e && e.message) || String(e);
				for (const it of items) out[it.idx] = { id: list[it.idx].id, ok: false, error: msg };
				continue;
			}
			for (let k = 0; k < items.length; k++) {
				const it = items[k];
				const r = res[k] || {};
				out[it.idx] = r.ok
					? { id: list[it.idx].id, ok: true, bytes: r.bytes }
					: { id: list[it.idx].id, ok: false, error: r.error || 'WRITE_FAILED' };
			}
		}
		for (const s of serial) {
			try {
				await this.write(s.id, s.buffer);
				out[s.idx] = { id: s.id, ok: true, bytes: s.buffer.length };
			} catch (e) {
				out[s.idx] = { id: s.id, ok: false, error: (e && e.message) || String(e) };
			}
		}
		return out;
	}

	async delete(id, recursive = false) {
		const found = this._findExisting(id);
		if (found?.file) return found.bridge.delete(found.path);
		if (found?.dir && recursive) return found.bridge.delete(found.path);
		if (!legacyFallbackAllowed(id)) return false;
		return this.legacyDb?.delete ? this.legacyDb.delete(id, recursive) : false;
	}

	async rename(from, to) {
		const value = await this.get(from, { max: true });
		if (value === undefined || value === null) return false;
		await this.write(to, value);
		await this.delete(from, true);
		return true;
	}

	async syncKeyInObj(id, key, value) {
		const current = (await this.get(id, { max: true })) || {};
		current[key] = value;
		return this.write(id, current);
	}

	async syncKeyInArray(id, value) {
		const current = (await this.get(id, { max: true })) || [];
		const values = Array.isArray(current) ? current : Object.keys(current || {});
		if (!values.includes(value)) values.push(value);
		return this.write(id, values);
	}

	_candidateFamilies(id) {
		return familyForPath(id).filter(family => this.bridges[family]);
	}

	_bridgeForWrite(id) {
		const family = familyForPath(id).find(name => this.bridges[name]);
		return family ? this.bridges[family] : null;
	}

	_findExisting(id) {
		const clean = normalizeSocialPath(id);
		for (const family of this._candidateFamilies(id)) {
			const bridge = this.bridges[family];
			const file = possibleFilePaths(clean).find(candidate => bridge.getBlobToken(candidate));
			if (file) return { bridge, family, path: file, file: true };
			if (bridge.exists(clean)) return { bridge, family, path: clean, dir: true };
		}
		return null;
	}
}

module.exports = { AwtsmoosDbDosBridge, familyDbFiles, familyForPath };
