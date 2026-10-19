// B"H
/**
 * @file stateRootsAsync.js
 * @description Discover bounded pages of command roots without monopolizing
 * the event loop or rescanning the same initial root page at every continuation.
 */
const path = require("node:path");
const AsyncFs = require("./asyncFileSystem.js");
const Family = require("./stateRootFamily.js");
const Roots = require("./stateRoots.js");

const EXACT_FAMILY_MAX_ROOTS = 512;

/** Discover the requested bounded page of ordinary state roots. */
async function discover(config = {}, options = {}) {
	return discoverSelected(config, options, null, options.maxRoots);
}

/** Preserve the larger same-tunnel window for exact identity-safe lookup. */
async function discoverFamily(config = {}, options = {}) {
	const current = Roots.currentRoot(config, options);
	return discoverSelected(
		config,
		options,
		names => Family.select(names, current),
		options.maxFamilyRoots || EXACT_FAMILY_MAX_ROOTS
	);
}

/** Enumerate and sort roots once before applying a stable page offset. */
async function discoverSelected(config, options, select, configuredMax) {
	const current = Roots.currentRoot(config, options);
	const base = path.resolve(
		options.stateBase || config.deviceStateBase || path.dirname(current)
	);
	const maxRoots = Roots.positive(configuredMax, 32);
	const rootOffset = nonnegativeOffset(options.rootOffset);
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
		rootOffset,
		truncated: entries.length > rootOffset + maxRoots,
		roots: entries.slice(rootOffset, rootOffset + maxRoots)
	};
}

/** Reject negative or noninteger offsets without changing historical defaults. */
function nonnegativeOffset(value) {
	const offset = Number(value || 0);
	return Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
}

/** Include the active state root once, before pagination. */
async function includeCurrentRoot(entries, current, options = {}) {
	const currentEntry = await describe(current, current, options);
	if (currentEntry.directory && !entries.some(entry => entry.path === current)) {
		entries.push(currentEntry);
	}
}

/** Return evidence for one root without following missing entries. */
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
	includeCurrentRoot,
	nonnegativeOffset
};
