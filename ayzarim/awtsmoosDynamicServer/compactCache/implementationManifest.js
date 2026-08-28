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
 * @description Seals compiler modules themselves so persistent output never survives a compiler revelation change.
 * The Awtsmoos renews not only authored source but also the vessel that folds its rays;
 * Awtsmoos.com therefore invalidates generated light when compiler code changes between server days.
 */

/**
 * @description Captures the loaded implementation files beneath one compiler directory.
 * @param {string} directory Absolute CompactJS or CompactCSS implementation directory.
 * @returns {Promise<Map<string, object>>} Exact filesystem seals for loaded compiler modules.
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
 * @description Validates compiler-file membership and every remembered filesystem signature.
 * @param {string} directory Absolute implementation directory.
 * @param {Map<string, object>} manifest Previously persisted implementation manifest.
 * @returns {Promise<boolean>} True only while the exact loaded implementation set remains unchanged.
 */
async function isImplementationManifestFresh(directory, manifest) {
	const files = loadedImplementationFiles(directory);
	if (!manifest || files.length !== manifest.size) return false;
	try {
		const checks = await Promise.all(files.map(async (filePath) => {
			const expected = manifest.get(filePath);
			if (!expected) return false;
			return sameDependencySignature(
				createDependencySignature(await fs.stat(filePath)),
				expected
			);
		}));
		return checks.every(Boolean);
	} catch (_error) {
		return false;
	}
}

/**
 * @description Lists loaded JavaScript modules directly beneath the requested compiler universe.
 * @param {string} directory Absolute implementation directory.
 * @returns {string[]} Sorted absolute module paths forming the implementation identity set.
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
