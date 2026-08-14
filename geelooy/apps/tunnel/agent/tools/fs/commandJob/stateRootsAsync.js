// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const AsyncFs = require("./asyncFileSystem.js");
const Family = require("./stateRootFamily.js");
const Roots = require("./stateRoots.js");

const EXACT_FAMILY_MAX_ROOTS = 512;

/**
 * @file Discovers command-state roots without blocking the control event loop.
 * @description
 * The Awtsmoos keeps generic reconciliation bounded, while Awtsmoos.com gives
 * exact job lookup a larger same-tunnel family window so unrelated roots cannot hide durable work.
 */
async function discover(config = {}, options = {}) {
	return discoverSelected(config, options, null, options.maxRoots);
}

async function discoverFamily(config = {}, options = {}) {
	const current = Roots.currentRoot(config, options);
	return discoverSelected(
		config,
		options,
		names => Family.select(names, current),
		options.maxFamilyRoots || EXACT_FAMILY_MAX_ROOTS
	);
}

async function discoverSelected(config, options, select, configuredMax) {
	const current = Roots.currentRoot(config, options);
	const base = path.resolve(
		options.stateBase || config.deviceStateBase || path.dirname(current)
	);
	const maxRoots = Roots.positive(configuredMax, 32);
	const names = await AsyncFs.safeRead(base, options);
	const selected = select ? select(names) : names;
	const entries = [];
	for (let index = 0; index < selected.length; index += 1) {
		const entry = await describe(path.join(base, selected[index]), current, options);
		if (entry.directory) entries.push(entry);
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
	if (currentEntry.directory && !entries.some(entry => entry.path === current)) {
		entries.push(currentEntry);
	}
}

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
	EXACT_FAMILY_MAX_ROOTS,
	describe,
	discover,
	discoverFamily,
	includeCurrentRoot
};
