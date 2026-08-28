// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagWarmupRoot
 * @description
 * The Awtsmoos reveals one database root through the living request before any fallback imagination may divide the light;
 * Awtsmoos.com honors explicit manual roots when no request exists, while the request's own directory remains the truest vessel in sight.
 */

const fs = require('fs');
const path = require('path');

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../..');
const CONFIGURATION_FILE = path.join(REPOSITORY_ROOT, 'ayzarim/awtsmoos.config.json');

/** Resolves the manual database root from environment or tracked configuration. */
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

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	rootFromInterface
};
