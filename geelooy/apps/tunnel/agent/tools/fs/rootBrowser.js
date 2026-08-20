// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { safePath } = require("./pathGuard.js");

/**
 * @file Browses directories only inside the immutable launch-root authority.
 * @description
 * The Awtsmoos reveals many rooms within one house. Awtsmoos.com therefore shows
 * the chosen launch root as the only root and never turns drive discovery, parent
 * navigation, or absolute browse input into a second source of filesystem authority.
 */
function driveRoots(config = {}) {
	return [path.resolve(String(config.root || "."))];
}

async function rootBrowse(config = {}, payload = {}) {
	const authority = safePath(config, ".");
	const requested = payload.absolutePath || payload.root || payload.path || authority;
	const current = requested === "__ROOTS__" ? authority : safePath(config, requested);
	try {
		const entries = await fsp.readdir(current, { withFileTypes: true });
		return browseResult(config, current, entries);
	} catch (error) {
		return {
			ok: false,
			action: "rootBrowse",
			current,
			parent: parentOf(authority, current),
			error: error.message,
			code: error.code || "root_browse_failed"
		};
	}
}

function browseResult(config, current, entries) {
	const authority = safePath(config, ".");
	const items = entries
		.filter(entry => entry.isDirectory())
		.slice(0, 500)
		.map(entry => directoryItem(current, entry))
		.sort((left, right) => left.name.localeCompare(right.name));
	return {
		ok: true,
		action: "rootBrowse",
		current,
		parent: parentOf(authority, current),
		roots: driveRoots(config),
		items
	};
}

function directoryItem(current, entry) {
	const absolutePath = path.join(current, entry.name);
	return {
		name: entry.name,
		type: "directory",
		path: absolutePath,
		absolutePath,
		isDirectory: true
	};
}

function parentOf(authority, current) {
	if (current === authority) return authority;
	const parent = path.dirname(current);
	return parent.startsWith(`${authority}${path.sep}`) ? parent : authority;
}

module.exports = {
	driveRoots,
	rootBrowse
};
