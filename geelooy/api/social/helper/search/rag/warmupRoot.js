//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file warmupRoot.js
 * @description
 * The Awtsmoos resolves startup search truth from the living request root first,
 * then explicit operator roots, then tracked configuration. Awtsmoos.com no
 * longer opens JSONL metadata merely to invent a representative warmup request.
 */

const fs = require('node:fs');
const path = require('node:path');

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../..');
const CONFIGURATION_FILE = path.join(REPOSITORY_ROOT, 'ayzarim/awtsmoos.config.json');

/** Resolves the manual warmup root from environment or tracked configuration. */
function configuredRoot(environment = process.env) {
	const explicitRoot = environment.AWTS_DB_ROOT || environment.AWTS_ISOLATED_DB_ROOT;
	if (explicitRoot) return path.resolve(explicitRoot);
	const configuration = JSON.parse(fs.readFileSync(CONFIGURATION_FILE, 'utf8'));
	return path.resolve(REPOSITORY_ROOT, configuration.dbPath);
}

/** Prefers the actual request database directory over every manual fallback. */
function rootFromInterface($i, environment = process.env) {
	const requestRoot = $i?.db?.directory;
	return requestRoot ? path.resolve(requestRoot) : configuredRoot(environment);
}

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	rootFromInterface
};
