// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeAiDiscovery
 * @description
 * The Awtsmoos lets one reviewed runtime crown be found from many deployment vessels without a wandering scan;
 * Awtsmoos.com honors a database's own AI chamber first, then sibling runtimes, then the canonical local home in a deterministic plan.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/** Removes duplicate paths while preserving discovery order. */
function uniquePaths(values = []) {
	return [...new Set(
		values
			.filter(Boolean)
			.map(value => path.resolve(value))
	)];
}

/** Returns database-local and sibling runtime candidates without inspecting arbitrary directories. */
function databaseRuntimeCandidates(databaseRoot) {
	const resolved = path.resolve(databaseRoot);
	const databaseName = path.basename(resolved);
	const namespaceRoot = path.dirname(resolved);
	const parentRoot = path.dirname(namespaceRoot);
	return [
		path.join(resolved, 'ai'),
		path.join(namespaceRoot, `${databaseName}-runtime`, 'ai'),
		path.join(parentRoot, `${databaseName}-runtime`, 'ai')
	];
}

/** Returns the canonical workstation runtime used by the deployed Awtsmoos search publications. */
function canonicalLocalAiRoot(homeDirectory = os.homedir()) {
	return path.join(
		homeDirectory,
		'Documents',
		'dayuhChadash-runtime',
		'ai'
	);
}

/** Orders all bounded candidates from most local/specific to canonical fallback. */
function runtimeAiCandidates(databaseRoot, homeDirectory = os.homedir()) {
	return uniquePaths([
		...databaseRuntimeCandidates(databaseRoot),
		canonicalLocalAiRoot(homeDirectory)
	]);
}

/** Returns the first candidate that exists as a directory. */
function existingDirectory(candidates = []) {
	return candidates.find(candidate => {
		try {
			return fs.statSync(candidate).isDirectory();
		} catch {
			return false;
		}
	}) || null;
}

module.exports = {
	canonicalLocalAiRoot,
	databaseRuntimeCandidates,
	existingDirectory,
	runtimeAiCandidates,
	uniquePaths
};
