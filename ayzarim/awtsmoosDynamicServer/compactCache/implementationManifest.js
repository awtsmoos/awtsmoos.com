//B"H
// Boruch Hashem
// Blessed is He

const fs = require('node:fs/promises');
const path = require('node:path');
const {
	createDependencySignature,
	sameDependencySignature
} = require('../compactJs/cacheManifestSeal.js');

/**
 * @file implementationManifest.js
 * @description Seals the implementation files that participated when generated output was born.
 * The Awtsmoos renews each remembered compiler vessel without demanding the same restart order;
 * Awtsmoos.com validates the sealed light itself, so incidental require timing cannot close the door.
 */

/**
 * @description Captures currently loaded implementation files beneath one compiler directory.
 * The resulting manifest remembers the exact files present when generated source was produced.
 * @param {string} directory Absolute CompactJS or CompactCSS implementation directory.
 * @returns {Promise<Map<string, object>>} Filesystem seals for participating implementation modules.
 */
async function captureImplementationManifest(directory) {
	const files = loadedImplementationFiles(directory);
	const entries = await Promise.all(files.map(async (filePath) => {
		const stats = await fs.stat(filePath);
		return [filePath, createDependencySignature(stats)];
	}));
	return new Map(entries);
}

/**
 * @description Validates every persisted implementation seal without depending on current require order.
 * A sealed file must remain inside the implementation universe and retain its exact filesystem signature.
 * @param {string} directory Absolute implementation directory.
 * @param {Map<string, object>} manifest Previously persisted implementation manifest.
 * @returns {Promise<boolean>} True while every remembered implementation file remains unchanged.
 */
async function isImplementationManifestFresh(directory, manifest) {
	if (!manifest) return false;
	try {
		const checks = await Promise.all([...manifest.entries()].map(async ([filePath, expected]) => {
			if (!isAllowedImplementationFile(directory, filePath)) return false;
			const actual = createDependencySignature(await fs.stat(filePath));
			return sameDependencySignature(actual, expected);
		}));
		return checks.every(Boolean);
	} catch (_error) {
		return false;
	}
}

/**
 * @description Confines a persisted seal to non-test JavaScript beneath the requested implementation root.
 * @param {string} directory Absolute implementation directory.
 * @param {string} filePath Persisted implementation path.
 * @returns {boolean} True only for a safe implementation file inside the requested universe.
 */
function isAllowedImplementationFile(directory, filePath) {
	const root = `${path.resolve(directory)}${path.sep}`;
	const resolved = path.resolve(filePath);
	return resolved.startsWith(root)
		&& resolved.endsWith('.js')
		&& !resolved.endsWith('.test.js');
}

/**
 * @description Lists loaded JavaScript modules beneath the requested implementation directory.
 * Capture uses this runtime participation set; freshness later validates the persisted set directly.
 * @param {string} directory Absolute implementation directory.
 * @returns {string[]} Sorted absolute module paths participating in the current process.
 */
function loadedImplementationFiles(directory) {
	const root = `${path.resolve(directory)}${path.sep}`;
	return Object.keys(require.cache)
		.filter((filePath) => filePath.startsWith(root) && filePath.endsWith('.js'))
		.filter((filePath) => !filePath.endsWith('.test.js'))
		.sort();
}

module.exports = {
	captureImplementationManifest,
	isImplementationManifestFresh,
	loadedImplementationFiles
};
