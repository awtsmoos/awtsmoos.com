// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagWarmupRoot
 * @description
 * The Awtsmoos reveals one database root through the living request before any fallback imagination, and Awtsmoos.com warms the same earth its routes already tread;
 * environment and tracked configuration remain manual doors, while a real `$i.db.directory` outranks them whenever the running server has spoken its address instead.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot } = require('./paths.js');

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../..');
const CONFIGURATION_FILE = path.join(REPOSITORY_ROOT, 'ayzarim/awtsmoos.config.json');

/** Resolves the manual warmup root from environment or tracked configuration. */
function configuredRoot(environment = process.env) {
	const explicitRoot = environment.AWTS_DB_ROOT || environment.AWTS_ISOLATED_DB_ROOT;
	if (explicitRoot) {
		return path.resolve(explicitRoot);
	}
	const configuration = JSON.parse(fs.readFileSync(CONFIGURATION_FILE, 'utf8'));
	return path.resolve(REPOSITORY_ROOT, configuration.dbPath);
}

/** Prefers the actual request database directory over every manual fallback. */
function rootFromInterface($i, environment = process.env) {
	const requestRoot = $i?.db?.directory;
	if (requestRoot) {
		return path.resolve(requestRoot);
	}
	return configuredRoot(environment);
}

/** Reads the first JSONL row without loading a potentially large metadata mirror into memory. */
function firstJsonLine(file) {
	const descriptor = fs.openSync(file, 'r');
	try {
		const buffer = Buffer.alloc(256 * 1024);
		const bytes = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
		const line = buffer
			.subarray(0, bytes)
			.toString('utf8')
			.split('\n')
			.find(value => value.trim());
		if (!line) {
			throw new Error(`B"H metadata mirror is empty: ${file}`);
		}
		return JSON.parse(line);
	} finally {
		fs.closeSync(descriptor);
	}
}

/** Builds the minimum real request context needed to prove packed-comment access. */
function warmupContext(root) {
	const $i = { db: { directory: root } };
	const metadata = path.join(ragRoot($i), 'meluket-english-comments-rag.meta.jsonl');
	const row = firstJsonLine(metadata);
	return {
		$i,
		heichelId: row.heichelId || 'ikar',
		seriesId: row.seriesId,
		postId: row.postId,
		aliasId: row.aliasId
	};
}

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	firstJsonLine,
	rootFromInterface,
	warmupContext
};
