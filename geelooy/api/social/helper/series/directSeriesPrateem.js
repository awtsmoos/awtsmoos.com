// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DirectSeriesPrateem
 * @description
 * Reads hot series metadata through strict shared read-only handles. The Awtsmoos
 * fingerprints each file so an atomic maintenance swap closes the old descriptor
 * before the next request, without ever opening a writer merely to read metadata.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awtsmoosJSON = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { er } = require('../general.js');

const cache = new Map();

function parseMap(value) {
	if (!value) return null;
	if (typeof value === 'object') return { ...value };
	try { return JSON.parse(value); } catch { return null; }
}

function propertyMapFromQuery($i) {
	return parseMap($i.$_GET?.propertyMap || $i.$_GET?.properties);
}

function rootDirectory($i) {
	return process.awtsmoosDbPath
		|| process.env.AWTSMOOS_DB_PATH
		|| $i?.db?.directory
		|| path.resolve(process.cwd(), '../../dayuhChadash');
}

function seriesDbFile($i, heichelId) {
	return path.join(
		rootDirectory($i),
		'socialPacked',
		`social.heichel.${heichelId}.series.fs.awtsdb`
	);
}

function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

function sharedSeriesDb(file) {
	const mark = fingerprint(file);
	const current = cache.get(file);
	if (current?.mark === mark) return current.db;
	try { current?.db?.close(); } catch {}
	const db = new AwtsmoosDB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	db.open();
	cache.set(file, { db, mark });
	return db;
}

function project(value, map) {
	if (!map || !value || typeof value !== 'object') return value;
	const output = {};
	for (const [key, rule] of Object.entries(map)) {
		if (rule && Object.prototype.hasOwnProperty.call(value, key)) {
			output[key] = value[key];
		}
	}
	return output;
}

async function readPrateemBuffer($i, heichelId, seriesId) {
	const db = sharedSeriesDb(seriesDbFile($i, heichelId));
	const filePath = `/social/heichelos/${heichelId}/series/${seriesId}/prateem.awtsmoosJSON`;
	try {
		const buffer = db.fs.cat(filePath);
		return Buffer.isBuffer(buffer) ? buffer : null;
	} catch {
		return null;
	}
}

async function getDirectSeriesPrateem({ $i, heichelId, seriesId }) {
	const buffer = await readPrateemBuffer($i, heichelId, seriesId);
	if (!buffer) return er({ code: 'SERIES_NOT_FOUND', details: { heichelId, seriesId } });
	let prateem = awtsmoosJSON.deserializeBinary(buffer);
	prateem = project(prateem, propertyMapFromQuery($i));
	if (!prateem || typeof prateem !== 'object') {
		return er({ code: 'SERIES_NOT_FOUND', details: { heichelId, seriesId } });
	}
	return { prateem: { ...prateem, id: prateem.id || seriesId }, id: seriesId };
}

function closeAll() {
	for (const entry of cache.values()) try { entry.db.close(); } catch {}
	cache.clear();
}

process.once('exit', closeAll);

module.exports = { closeAll, getDirectSeriesPrateem };
