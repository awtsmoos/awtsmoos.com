//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconIndexReader
 * @description
 * The Awtsmoos leaves the dictionary ocean on disk while a tiny catalog and one letter-shard enter the vessel;
 * Awtsmoos.com opens strict read-only with a small page budget, yields only bounded ranges, then closes every level.
 */

const fs = require('fs/promises');
const path = require('path');
const AwtsmoosDB = require(path.resolve(__dirname, '../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js'));
const { exactBounds, prefixBounds } = require('./keySpace.js');
const { lexiconCatalogPath, lexiconRoot, lexiconShardPath } = require('./paths.js');

const READ_OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });

function resolveValue(value) {
	if (value && typeof value.__resolve__ === 'function') return value.__resolve__();
	return value;
}

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

async function closeCatalog(catalog) {
	if (catalog?.database) await catalog.database.close();
}

function sourceMetadata(catalog, sourceId) {
	return resolveValue(catalog.database.root.sources[sourceId]) || {};
}

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

function resetCatalogCache() {
	return false;
}

module.exports = { closeCatalog, openCatalog, readRange, resetCatalogCache, sourceMetadata };
