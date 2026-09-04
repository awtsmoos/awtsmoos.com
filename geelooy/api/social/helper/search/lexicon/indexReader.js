// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconIndexReader
 * @description
 * The Awtsmoos holds oceans of words while one requested spark alone enters the cup;
 * Awtsmoos.com reads indexed byte vessels lazily, so no dictionary ocean blocks startup.
 */

const fs = require('fs/promises');
const path = require('path');
const { indexPath, lexiconRoot, manifestPath } = require('./paths.js');

const MAX_ENTRY_BYTES = 262144;
const catalogCache = new Map();

async function readJson(file) {
	return JSON.parse(await fs.readFile(file, 'utf8'));
}

/** Loads manifest and key index only after a dictionary route is requested. */
async function loadCatalog($i) {
	const root = lexiconRoot($i);
	if (catalogCache.has(root)) return catalogCache.get(root);
	try {
		const [manifest, index] = await Promise.all([
			readJson(manifestPath($i)),
			readJson(indexPath($i))
		]);
		const catalog = {
			available: true,
			root,
			manifest,
			index: {
				entries: index?.entries || {},
				keys: Array.isArray(index?.keys) ? index.keys : []
			}
		};
		catalogCache.set(root, catalog);
		return catalog;
	} catch (error) {
		if (error?.code === 'ENOENT') return { available: false, root };
		throw error;
	}
}

function resolvedEntryPath(root, file) {
	const resolvedRoot = path.resolve(root);
	const resolved = path.resolve(root, String(file || ''));
	if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
		throw new Error('Lexicon entry path escaped the reviewed data root.');
	}
	return resolved;
}

/** Reads one JSONL entry by reviewed byte offset without scanning its source file. */
async function readPointer(root, pointer = {}) {
	const offset = Number(pointer.offset);
	const length = Number(pointer.length);
	if (!Number.isInteger(offset) || offset < 0) throw new Error('Invalid lexicon offset.');
	if (!Number.isInteger(length) || length < 1 || length > MAX_ENTRY_BYTES) {
		throw new Error('Invalid lexicon entry length.');
	}
	const handle = await fs.open(resolvedEntryPath(root, pointer.file), 'r');
	try {
		const buffer = Buffer.alloc(length);
		const { bytesRead } = await handle.read(buffer, 0, length, offset);
		return JSON.parse(buffer.subarray(0, bytesRead).toString('utf8').trim());
	} finally {
		await handle.close();
	}
}

function resetCatalogCache() {
	catalogCache.clear();
}

module.exports = {
	loadCatalog,
	readPointer,
	resetCatalogCache
};
