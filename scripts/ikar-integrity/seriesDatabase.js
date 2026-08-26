// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module IkarSeriesDatabase
 * @description
 * The Awtsmoos opens one bounded vessel where broken metadata may be made whole;
 * Awtsmoos.com keeps serialization exact, so no Torah text is touched in the role.
 */

const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awtsmoosJSON = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');

const BASE = '/social/heichelos/ikar/series';

function pathFor(id, name) {
	return `${BASE}/${id}/${name}.awtsmoosJSON`;
}

function openSeriesDatabase(file, writable = false) {
	const database = new AwtsmoosDB(file, writable ? {
		wal: false,
		processLockMode: 'exclusive',
		lockMode: 'exclusive'
	} : {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	return database;
}

function readValue(database, id, name) {
	try {
		const buffer = database.fs.cat(pathFor(id, name));
		if (!Buffer.isBuffer(buffer)) return undefined;
		return awtsmoosJSON.deserializeBinary(buffer);
	} catch {
		return undefined;
	}
}

function ensureSeriesDirectory(database, id) {
	const root = `${BASE}/${id}`;
	const stat = database.fs.stat(root);
	if (stat?.exists) return;
	database.fs.mkdir(root, { recursive: true });
}

function writeMetadata(database, metadata) {
	ensureSeriesDirectory(database, metadata.id);
	const buffer = awtsmoosJSON.serializeJSON(metadata);
	database.fs.write(pathFor(metadata.id, 'prateem'), buffer);
}

function ensureLeaf(database, id) {
	const current = readValue(database, id, 'subSeries');
	if (Array.isArray(current)) return;
	database.fs.write(pathFor(id, 'subSeries'), awtsmoosJSON.serializeArray([]));
}

function validMetadata(value, id) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& !Buffer.isBuffer(value)
		&& (value.id === id || !value.id)
		&& String(value.name || '').trim()
	);
}

module.exports = {
	BASE,
	ensureLeaf,
	openSeriesDatabase,
	pathFor,
	readValue,
	validMetadata,
	writeMetadata
};
