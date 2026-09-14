//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconIndexReader
 * @description
 * Keeps the dictionary ocean on disk while opening only bounded catalog and
 * letter-shard ranges. New compact binary rows decode one-at-a-time; legacy
 * object-backed rows remain readable until their generation is replaced.
 */

const fs = require('fs/promises');
const path = require('path');
const AwtsmoosDB = require(path.resolve(
	__dirname,
	'../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js'
));
const { exactBounds, prefixBounds } = require('./keySpace.js');
const { lexiconCatalogPath, lexiconRoot, lexiconShardPath } = require('./paths.js');
const {
	decodeLexiconRecord,
	isCompactLexiconRecord
} = require('./binary/recordReader.js');

const READ_OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });

/** Resolves lazy DB values and decodes compact records one row at a time. */
function resolveValue(value) {
	const resolved = value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
	return isCompactLexiconRecord(resolved)
		? decodeLexiconRecord(resolved)
		: resolved;
}

/** Opens the native catalog while keeping strict read-only semantics. */
async function openCatalog($i) {
	const root = lexiconRoot($i);
	const file = lexiconCatalogPath($i);
	try {
		await fs.access(file);
	} catch (error) {
		if (error?.code === 'ENOENT') return { available: false, root, file };
		throw error;
	}
	const database = new AwtsmoosDB(file, READ_OPTIONS);
	try {
		await database.open();
		const meta = resolveValue(database.root.meta);
		if (!database.root.sources || !meta) throw new Error('lexicon_catalog_incomplete');
		return { available: true, root, file, database, meta };
	} catch (error) {
		await database.close();
		throw error;
	}
}

/** Closes the catalog database when one was opened. */
async function closeCatalog(catalog) {
	if (catalog?.database) await catalog.database.close();
}

/** Returns one source's native metadata record. */
function sourceMetadata(catalog, sourceId) {
	return resolveValue(catalog.database.root.sources[sourceId]) || {};
}

/** Reads only the requested exact/prefix range from one source letter shard. */
async function readRange(catalog, sourceId, token, normalized, exact, maximum) {
	const file = lexiconShardPath(catalog.root, sourceId, token);
	try {
		await fs.access(file);
	} catch (error) {
		if (error?.code === 'ENOENT') return [];
		throw error;
	}
	const database = new AwtsmoosDB(file, READ_OPTIONS);
	const results = [];
	try {
		await database.open();
		const bounds = exact ? exactBounds(normalized) : prefixBounds(normalized);
		for await (const row of database.range(database.root.entries, bounds[0], bounds[1])) {
			const entry = resolveValue(row?.value);
			if (!entry || (!exact && entry.normalized === normalized)) continue;
			results.push(entry);
			if (results.length >= maximum) break;
		}
		return results;
	} finally {
		await database.close();
	}
}

/** Compatibility hook retained for callers; the reader has no global cache. */
function resetCatalogCache() {
	return false;
}

module.exports = {
	closeCatalog,
	openCatalog,
	readRange,
	resetCatalogCache,
	sourceMetadata
};
