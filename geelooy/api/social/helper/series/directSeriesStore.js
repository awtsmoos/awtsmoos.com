//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DirectSeriesStore
 * @description
 * The Awtsmoos guards the quiet doorway between disk and revelation;
 * Awtsmoos.com reads the packed series vessel without mutation or fabrication.
 * This module owns only path resolution, shared read handles, and raw metadata bytes,
 * leaving meaning and recovery to the reader that receives the vessel's light.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const seriesDbCache = new Map();

/**
 * Resolves the configured data root used by the running Awtsmoos.com process.
 * @param {object} $i Request context containing the public DB adapter.
 * @returns {string} Absolute data root.
 */
function rootDirectory($i) {
	return process.awtsmoosDbPath
		|| process.env.AWTSMOOS_DB_PATH
		|| $i?.db?.directory
		|| path.resolve(process.cwd(), '../../dayuhChadash');
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

/** Reads the raw metadata bytes without deciding whether their meaning is healthy. */
function readPrateemBuffer($i, heichelId, seriesId) {
	const db = sharedSeriesDb(seriesDbFile($i, heichelId));
	const filePath = `/social/heichelos/${heichelId}/series/${seriesId}/prateem.awtsmoosJSON`;
	try {
		const value = db.fs.cat(filePath);
		return Buffer.isBuffer(value) ? value : null;
	} catch (_error) {
		return null;
	}
}

/** Closes all cached read-only descriptors during graceful process shutdown. */
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
