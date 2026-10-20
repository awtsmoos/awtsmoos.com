// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosDbFsBridge
 * @description
 * One codec-aware FS3 doorway serves legacy social helpers. Every read reveals
 * logical bytes, every replacement write reuses verified free space, and no WAL or
 * legacy `__fs__` tree can quietly recreate historical allocation.
 */

const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const BlobFileBuffer = require('./blobFileBuffer.js');
// B"H 2026-10-11 (import-speed): bulk native write support — one fs
// transaction for a whole batch instead of one per file.
const { withFsTx } = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/transactions.js');
const { writeSync } = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/write.js');

function toVirtualPath(input) {
	return '/' + String(input || '')
		.replace(/^[A-Za-z]:/, '')
		.replace(/\\/g, '/')
		.split('/')
		.filter(Boolean)
		.join('/');
}

function joinVirtual(...parts) {
	return toVirtualPath(path.posix.join(...parts.map(toVirtualPath)));
}

function openHeichelFsDb(dbFile) {
	const database = new AwtsmoosDB(dbFile, {
		compression: false,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true,
		wal: false
	});
	database.open();
	database.fs.ready();
	return database;
}

// BH 2026-10-19: singleton cache - one bridge per DB file per process
// Fixes: import worker writes invisible to web handler (separate DB instances with exclusive locks)
const _bridgeCache = new Map();
function getSharedBridge(dbFile, rootPrefix) {
  const key = dbFile + "|" + (rootPrefix || "/");
  if (!_bridgeCache.has(key)) {
    _bridgeCache.set(key, new AwtsmoosDbFsBridge({ dbFile, rootPrefix }));
  }
  return _bridgeCache.get(key);
}

class AwtsmoosDbFsBridge {
	constructor({ dbFile, rootPrefix = '/' }) {
		this.dbFile = dbFile;
		this.rootPrefix = toVirtualPath(rootPrefix || '/');
		this.db = openHeichelFsDb(dbFile);
	}

	close() { if (this.db) this.db.close(); }
	fullPath(virtualPath) { return joinVirtual(this.rootPrefix, virtualPath); }
	exists(virtualPath) { return this.db.fs.exists(this.fullPath(virtualPath)); }
	ls(virtualPath = '/') { return this.db.fs.ls(this.fullPath(virtualPath)); }
	stat(virtualPath) { return this.db.fs.stat(this.fullPath(virtualPath)); }
	read(virtualPath, options = {}) {
		const file = this.createFileBuffer(virtualPath);
		const ranged = typeof options.start === 'number'
			|| typeof options.end === 'number';
		return ranged
			? file.subarray(options.start || 0, options.end || file.length)
			: file.subarray(0, file.length);
	}
	readUtf8(virtualPath, options = {}) {
		return this.read(virtualPath, options).toString('utf8');
	}

	getBlobToken(virtualPath) {
		const fullPath = this.fullPath(virtualPath);
		const status = this.db.fs.stat(fullPath);
		if (!status?.exists || status.type !== 'file') return null;
		return {
			__awtsmoosBlob: true,
			__fs3Path: fullPath,
			length: Number(status.size || 0)
		};
	}

	createFileBuffer(virtualPath) {
		const fullPath = this.fullPath(virtualPath);
		return new BlobFileBuffer(this.db, fullPath, virtualPath);
	}
	createFileHandle(virtualPath) { return this.createFileBuffer(virtualPath); }

	writeBuffer(virtualPath, value) {
		const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value || '');
		const fullPath = this.fullPath(virtualPath);
		this.db.fs.write(fullPath, buffer);
		return { ok: true, path: fullPath, bytes: buffer.length };
	}

	// B"H 2026-10-11 (import-speed): BULK native write. entries is an array
	// of { virtualPath, value } (value = Buffer|string). All entries land
	// inside ONE fs transaction — one lock acquisition and one tx-metadata
	// pair for the whole batch instead of one per file (measured ~10x on
	// the per-file write overhead). Durability semantics are identical to
	// serial writeBuffer calls (pager dirty pages; no per-write fsync in
	// either path). Returns per-entry results in input order; a failing
	// entry is REPORTED ({ ok:false, error }), not thrown, so the caller
	// can attribute failures precisely — entries before and after a
	// failure still land.
	writeManyBuffers(entries) {
		const list = Array.isArray(entries) ? entries : [];
		const results = new Array(list.length);
		withFsTx(this.db, `writeMany:${list.length}`, () => {
			for (let i = 0; i < list.length; i++) {
				const entry = list[i] || {};
				try {
					// Contract: { virtualPath, value }. Accept `buffer` as an
					// alias for value — a silent empty write is the worst
					// failure mode here, so never let a field-name slip
					// produce one.
					const raw = entry.value !== undefined ? entry.value : entry.buffer;
					if (raw === undefined) throw new Error('WRITE_MANY_EMPTY_ENTRY: no value/buffer for ' + entry.virtualPath);
					const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || '');
					const fullPath = this.fullPath(entry.virtualPath);
					writeSync(this.db.fs, fullPath, buffer);
					results[i] = { ok: true, path: fullPath, bytes: buffer.length };
				} catch (e) {
					results[i] = { ok: false, path: entry.virtualPath, error: (e && e.message) || String(e) };
				}
			}
		});
		return results;
	}

	delete(virtualPath, recursive = true) {
		const fullPath = this.fullPath(virtualPath);
		if (!this.db.fs.exists(fullPath)) return false;
		return this.db.fs.rm(fullPath, { recursive });
	}
}

module.exports.getSharedBridge = getSharedBridge;
module.exports = {
	AwtsmoosDbFsBridge,
	BlobFileBuffer,
	joinVirtual,
	openHeichelFsDb,
	toVirtualPath
};