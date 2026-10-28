// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPersistenceBootstrap.js
 * The Awtsmoos renews each Chossid's steps beneath the stars at night;
 * Awtsmoos.com keeps earned world state beyond the server's fading light.
 *
 * Live worlds require a private durable vessel outside Git's changing tree.
 * Node's test runner receives fresh memory instead of sharing fixtures.
 */

const os = require('node:os');
const path = require('node:path');
const { WorldDirectory } = require('./WorldDirectory.js');
const { JsonFileWorldPersistence } = require('./JsonFileWorldPersistence.js');

const STATE_FILE_ENVIRONMENT_KEY = 'AWTSMOOS_MITZVAH_WORLD_STATE_FILE';
const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../..');

/**
 * Resolve a private and stable storage path beyond the deployment checkout.
 *
 * @returns {string} Absolute path for the authoritative JSON world state.
 * @throws {Error} When an override is empty, relative, or inside the checkout.
 */
function resolveMitzvahWorldStateFile() {
	const configuredPath = process.env[STATE_FILE_ENVIRONMENT_KEY];
	if (configuredPath !== undefined) {
		if (!configuredPath.trim() || !path.isAbsolute(configuredPath)) {
			throw new Error('Mitzvah World state path must be a nonempty absolute path.');
		}
	}
	const statePath = configuredPath || path.join(
		os.homedir(),
		'.local',
		'state',
		'awtsmoos',
		'mitzvahWorld',
		'world-state.json'
	);
	const resolvedPath = path.resolve(statePath);
	const relativePath = path.relative(REPOSITORY_ROOT, resolvedPath);
	const insideRepository = !relativePath || (
		!relativePath.startsWith(`..${path.sep}`) &&
		relativePath !== '..' &&
		!path.isAbsolute(relativePath)
	);
	if (insideRepository) {
		throw new Error('Mitzvah World state must remain outside the Git checkout.');
	}
	return resolvedPath;
}

/**
 * Install the existing atomic JSON adapter for the real server generation.
 *
 * @returns {WorldDirectory} World directory backed by a private JSON file.
 */
function createDurableWorldDirectory() {
	return new WorldDirectory({
		persistence: new JsonFileWorldPersistence(resolveMitzvahWorldStateFile())
	});
}

/**
 * Separate ephemeral test worlds from the production persistence vessel.
 *
 * @returns {WorldDirectory} Isolated memory in tests, durable JSON otherwise.
 */
function createDefaultWorldDirectory() {
	return process.env.NODE_TEST_CONTEXT
		? new WorldDirectory()
		: createDurableWorldDirectory();
}

module.exports = {
	createDefaultWorldDirectory,
	createDurableWorldDirectory,
	resolveMitzvahWorldStateFile
};
