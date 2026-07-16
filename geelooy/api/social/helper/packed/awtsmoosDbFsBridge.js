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

	delete(virtualPath, recursive = true) {
		const fullPath = this.fullPath(virtualPath);
		if (!this.db.fs.exists(fullPath)) return false;
		return this.db.fs.rm(fullPath, { recursive });
	}
}

module.exports = {
	AwtsmoosDbFsBridge,
	BlobFileBuffer,
	joinVirtual,
	openHeichelFsDb,
	toVirtualPath
};