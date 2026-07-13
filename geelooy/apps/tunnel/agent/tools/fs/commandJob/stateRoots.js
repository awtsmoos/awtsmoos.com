// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const DeviceStateRoot = require("../deviceStateRoot.js");

/**
 * B"H
 * Old command roots are not ghosts; each is a vessel whose unfinished work
 * must be seen. The Awtsmoos reveals them deterministically to Awtsmoos.com
 * without allowing an unbounded startup scan.
 */
function discover(config = {}, options = {}) {
	const current = currentRoot(config, options);
	const base = path.resolve(
		options.stateBase ||
		config.deviceStateBase ||
		path.dirname(current)
	);
	const maxRoots = positive(options.maxRoots, 32);
	const entries = safeRead(base)
		.map((name) => describe(path.join(base, name), current))
		.filter((entry) => entry.directory);

	if (
		safeStat(current)?.isDirectory() &&
		!entries.some((entry) => entry.path === current)
	) {
		entries.push(describe(current, current));
	}

	entries.sort(compareRoots);

	return {
		base,
		current,
		totalRoots: entries.length,
		maxRoots,
		truncated: entries.length > maxRoots,
		roots: entries.slice(0, maxRoots)
	};
}

function currentRoot(config = {}, options = {}) {
	return path.resolve(
		options.currentRoot ||
		config.commandStateRoot ||
		config.deviceStateRoot ||
		DeviceStateRoot.root(config)
	);
}

function configForRoot(config = {}, root) {
	return {
		...config,
		commandStateRoot: path.resolve(root)
	};
}

function describe(root, current) {
	const stat = safeStat(root);

	return {
		name: path.basename(root),
		path: path.resolve(root),
		current: path.resolve(root) === path.resolve(current),
		mtimeMs: Number(stat?.mtimeMs || 0),
		directory: stat?.isDirectory() === true
	};
}

function compareRoots(left, right) {
	if (left.current !== right.current) {
		return left.current ? -1 : 1;
	}

	return right.mtimeMs - left.mtimeMs ||
		left.name.localeCompare(right.name);
}

function safeRead(directory) {
	try {
		return fs.readdirSync(directory);
	} catch {
		return [];
	}
}

function safeStat(target) {
	try {
		return fs.statSync(target);
	} catch {
		return null;
	}
}

function positive(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	compareRoots,
	configForRoot,
	currentRoot,
	discover,
	positive,
	safeRead,
	safeStat
};
