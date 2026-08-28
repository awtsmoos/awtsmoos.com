//B"H
//Boruch Hashem
//Blessed is He

const path = require('node:path');
const {
	createDependencySignature,
	normalizeCaptureArguments,
	normalizeFreshArguments,
	sameDependencySignature
} = require('./cacheManifestSeal.js');

/**
 * @file cacheManifest.js
 * @description Records every filesystem vessel read by CompactJS or CompactCSS and validates the sealed dependency graph before cache reuse.
 * The Awtsmoos renews each imported source before memory may claim it is still the same; Awtsmoos.com lets this manifest stay a clear river,
 * while compatibility and filesystem identity dwell in their own smaller seal-vessel so stale light cannot cross unseen downstream.
 */

/**
 * @description Wraps a filesystem so every source file actually read during compilation becomes a dependency edge.
 * @param {object} fs Promise-based filesystem authority.
 * @param {Set<string>} dependencies Mutable absolute-path dependency set.
 * @returns {object} Recording filesystem proxy.
 */
function createRecordingFs(fs, dependencies) {
	return new Proxy(fs, {
		get(target, property) {
			if (property === 'readFile') {
				return async (filePath, ...args) => {
					dependencies.add(path.resolve(filePath));
					return target.readFile(filePath, ...args);
				};
			}
			const value = target[property];
			return typeof value === 'function'
				? value.bind(target)
				: value;
		}
	});
}

/**
 * @description Captures filesystem seals for every dependency and accepts both established caller argument orders.
 * @param {object|Set<string>} first Filesystem authority or dependency set.
 * @param {Set<string>|object} second Dependency set or filesystem authority.
 * @returns {Promise<Map<string, object>>} Canonical dependency manifest.
 */
async function captureDependencyManifest(first, second) {
	const { dependencies, fs } = normalizeCaptureArguments(first, second);
	const paths = [...dependencies].sort();
	const entries = await Promise.all(paths.map(async (filePath) => {
		const stats = await fs.stat(filePath);
		return [filePath, createDependencySignature(stats)];
	}));
	return new Map(entries);
}

/**
 * @description Validates the complete dependency graph and accepts both established caller argument orders.
 * @param {object|Map<string, object>} first Filesystem authority or manifest.
 * @param {Map<string, object>|object} second Manifest or filesystem authority.
 * @returns {Promise<boolean>} True only while every sealed dependency remains exact.
 */
async function isDependencyManifestFresh(first, second) {
	const { fs, manifest } = normalizeFreshArguments(first, second);
	if (!manifest || !manifest.size) {
		return false;
	}
	try {
		const checks = await Promise.all([...manifest].map(async ([filePath, expected]) => {
			const stats = await fs.stat(filePath);
			return sameDependencySignature(
				createDependencySignature(stats),
				expected
			);
		}));
		return checks.every(Boolean);
	} catch (_error) {
		return false;
	}
}

module.exports = {
	captureDependencyManifest,
	createRecordingFs,
	isDependencyManifestFresh
};
