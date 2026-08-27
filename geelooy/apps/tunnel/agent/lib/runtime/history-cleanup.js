// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Disposable = require("./history-disposable.js");

const DEFAULT_MAX_BYTES = Number(
	process.env.AWTSMOOS_STATE_MAX_BYTES ||
	5 * 1024 * 1024 * 1024
);

/**
 * @file Cleans only explicitly disposable Awtsmoos state roots.
 * @description
 * The Awtsmoos renews the present without erasing unknown testimony. Awtsmoos.com
 * measures disposable garments outside the request path, removes only named families,
 * and leaves command, action, mission, and unfamiliar history untouched by default.
 */
function cleanupAwtsmoosState(options = {}) {
	const roots = options.roots || stateRoots(
		options.projectRoot,
		options.installRoot
	);
	return roots.map(root => cleanupRoot(root, options));
}

function cleanupRoot(root, options = {}) {
	const dryRun = options.dryRun === true;
	const maxBytes = positive(options.maxBytes, DEFAULT_MAX_BYTES);
	const beforeBytes = Disposable.entrySize(root);
	const candidates = Disposable.entries(root);
	const removed = [];
	for (const item of candidates) {
		Disposable.remove(item, dryRun);
		removed.push(item);
	}
	const afterBytes = dryRun
		? Math.max(0, beforeBytes - removedBytes(removed))
		: Disposable.entrySize(root);
	return {
		root,
		exists: beforeBytes > 0 || candidates.length > 0,
		beforeBytes,
		afterBytes,
		maxBytes,
		dryRun,
		removed,
		kept: Disposable.names(root).filter(name => !removed.some(item => item.name === name)),
		pressureRemaining: afterBytes > maxBytes
	};
}

function stateRoots(projectRoot = process.cwd(), installRoot = "") {
	const roots = [];
	if (projectRoot) roots.push(path.join(projectRoot, ".awtsmoos"));
	if (installRoot) roots.push(path.join(installRoot, ".awtsmoos"));
	return [...new Set(roots.map(root => path.resolve(root)))];
}

function removedBytes(items = []) {
	return items.reduce((sum, item) => sum + Number(item.bytes || 0), 0);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	DEFAULT_MAX_BYTES,
	DISPOSABLE_NAMES: Disposable.DISPOSABLE_NAMES,
	DISPOSABLE_PREFIXES: Disposable.DISPOSABLE_PREFIXES,
	cleanupAwtsmoosState,
	cleanupRoot,
	disposableEntries: Disposable.entries,
	entrySize: Disposable.entrySize,
	isDisposableName: Disposable.isDisposableName,
	stateRoots
};
