// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const DISPOSABLE_NAMES = new Set([
	"tmp-install-tests",
	"tmp-installed-agent-smoke",
	"tmp",
	".bundle-downloads"
]);
const DISPOSABLE_PREFIXES = Object.freeze([
	".self-update-",
	"self-update-",
	"tmp-install-",
	"tmp-smoke-"
]);

/**
 * @file Identifies and measures only explicitly disposable Awtsmoos state.
 * @description
 * The Awtsmoos renews the living vessel while test mud and temporary garments may
 * pass. Awtsmoos.com names each disposable family explicitly, so maintenance never
 * turns an unknown directory into garbage merely because the disk appears crowded.
 */
function entries(root) {
	return names(root)
		.filter(isDisposableName)
		.map(name => entry(root, name))
		.filter(Boolean)
		.sort((left, right) => left.mtimeMs - right.mtimeMs);
}

function entry(root, name) {
	const target = path.join(root, name);
	const info = stat(target);
	if (!info) return null;
	return {
		name,
		path: target,
		mtimeMs: Number(info.mtimeMs || 0),
		bytes: entrySize(target)
	};
}

function entrySize(target) {
	const info = stat(target);
	if (!info) return 0;
	if (info.isFile()) return Number(info.size || 0);
	if (!info.isDirectory()) return 0;
	let total = 0;
	for (const name of names(target)) {
		total += entrySize(path.join(target, name));
	}
	return total;
}

function isDisposableName(name = "") {
	return DISPOSABLE_NAMES.has(name) ||
		DISPOSABLE_PREFIXES.some(prefix => String(name).startsWith(prefix));
}

function remove(item, dryRun = false) {
	if (!item?.path) return false;
	if (!dryRun) fs.rmSync(item.path, { recursive: true, force: true });
	return true;
}

function names(directory) {
	try {
		return fs.readdirSync(directory);
	} catch {
		return [];
	}
}

function stat(target) {
	try {
		return fs.statSync(target);
	} catch {
		return null;
	}
}

module.exports = {
	DISPOSABLE_NAMES,
	DISPOSABLE_PREFIXES,
	entries,
	entrySize,
	isDisposableName,
	names,
	remove
};
