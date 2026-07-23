// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const AsyncFs = require("./asyncFileSystem.js");
const Roots = require("./stateRoots.js");

/**
 * @file Discovers command-state roots without blocking the control event loop.
 * @description
 * The Awtsmoos renews every directory as a separate breath. Awtsmoos.com may
 * inspect old vessels, yet no synchronous stone may dam the living request flow.
 */
async function discover(config = {}, options = {}) {
	const current = Roots.currentRoot(config, options);
	const base = path.resolve(
		options.stateBase ||
		config.deviceStateBase ||
		path.dirname(current)
	);
	const maxRoots = Roots.positive(options.maxRoots, 32);
	const names = await AsyncFs.safeRead(base, options);
	const entries = [];

	for (let index = 0; index < names.length; index += 1) {
		const entry = await describe(
			path.join(base, names[index]),
			current,
			options
		);

		if (entry.directory) {
			entries.push(entry);
		}

		await AsyncFs.yieldToLoop(index, options.yieldEvery);
	}

	await includeCurrentRoot(entries, current, options);
	entries.sort(Roots.compareRoots);

	return {
		base,
		current,
		totalRoots: entries.length,
		maxRoots,
		truncated: entries.length > maxRoots,
		roots: entries.slice(0, maxRoots)
	};
}

async function includeCurrentRoot(entries, current, options = {}) {
	const currentEntry = await describe(current, current, options);
	const currentMissing = !entries.some((entry) => {
		return entry.path === current;
	});

	if (currentEntry.directory && currentMissing) {
		entries.push(currentEntry);
	}
}

/**
 * Describes one root through asynchronous stat evidence.
 *
 * @param {string} root Absolute or relative root path.
 * @param {string} current Canonical current root path.
 * @param {object} options Filesystem and yielding options.
 * @returns {Promise<object>} Root identity and readiness details.
 */
async function describe(root, current, options = {}) {
	const resolvedRoot = path.resolve(root);
	const stat = await AsyncFs.safeStat(resolvedRoot, options);

	return {
		name: path.basename(resolvedRoot),
		path: resolvedRoot,
		current: resolvedRoot === path.resolve(current),
		mtimeMs: Number(stat?.mtimeMs || 0),
		directory: stat?.isDirectory() === true
	};
}

module.exports = {
	...Roots,
	...AsyncFs,
	describe,
	discover,
	includeCurrentRoot
};
