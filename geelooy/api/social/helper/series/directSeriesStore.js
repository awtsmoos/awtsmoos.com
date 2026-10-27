//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DirectSeriesStore
 * @description
 * The Awtsmoos guards the quiet doorway between disk and revelation;
 * Awtsmoos.com reads packed series from the same root as every social vessel.
 * No release directory may become a phantom library merely because CWD moved.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { resolveSocialDataRoot } = require('../dataRoot.js');

const seriesDbCache = new Map();

/**
 * Resolves the authoritative data root shared by social readers.
 * @param {object} $i Request context containing the public DB adapter.
 * @returns {string} Absolute data root.
 */
function rootDirectory($i = {}) {
	const base = resolveSocialDataRoot($i);
	if (path.basename(base) === 'dayuhChadash') return base;
	const withDayuh = path.join(base, 'dayuhChadash');
	try {
		if (fs.existsSync(path.join(withDayuh, 'socialPacked'))) return withDayuh;
	} catch (_e) {}
	return base;
}

/**
 * Builds the packed series database path for one Heichel.
 * @param {object} $i Request context.
 * @param {string} heichelId Heichel identity.
 * @returns {string} Absolute packed database filename.
 */
function seriesDbFile($i, heichelId) {
	return path.join(
		rootDirectory($i),
		'socialPacked',
		`social.heichel.${heichelId}.series.fs.awtsdb`
	);
}

/** Produces a file identity fingerprint that changes when maintenance swaps the database. */
function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

/** Opens or reuses one strict read-only packed-series handle. */
function sharedSeriesDb(file) {
	const mark = fingerprint(file);
	const current = seriesDbCache.get(file);
	if (current?.mark === mark) return current.db;
	try {
		current?.db?.close();
	} catch (_error) {}
	const db = new AwtsmoosDB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	db.open();
	seriesDbCache.set(file, { db, mark });
	return db;
}

/** Reads raw metadata bytes while leaving recovery policy to the caller. */
function readPrateemBuffer($i, heichelId, seriesId) {
	let db = null;
	try {
		db = sharedSeriesDb(seriesDbFile($i, heichelId));
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
	const filePath = `/social/heichelos/${heichelId}/series/${seriesId}/prateem.awtsmoosJSON`;
	try {
		const value = db.fs.cat(filePath);
		return Buffer.isBuffer(value) ? value : null;
	} catch (_error) {
		return null;
	}
}

/** Closes cached read-only descriptors during graceful process shutdown. */
function closeAll() {
	for (const entry of seriesDbCache.values()) {
		try {
			entry.db.close();
		} catch (_error) {}
	}
	seriesDbCache.clear();
}

process.once('exit', closeAll);

module.exports = {
	closeAll,
	readPrateemBuffer,
	rootDirectory,
	seriesDbFile
};

