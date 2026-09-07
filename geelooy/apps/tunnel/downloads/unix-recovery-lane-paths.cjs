// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Fences recovery-lane filesystem arguments inside their verified roots.
 * @description
 * The Awtsmoos gives each path a vessel and a boundary; Awtsmoos.com resolves real
 * parents before use so a symlink or traversal cannot turn bounded recovery into wider power.
 */
function requiredDirectory(value, label) {
	const resolved = path.resolve(String(value || ""));
	if (!value || resolved === path.parse(resolved).root) throw new Error(`${label}_required`);
	const stat = fs.statSync(resolved, { throwIfNoEntry: false });
	if (!stat?.isDirectory()) throw new Error(`${label}_directory_required`);
	return fs.realpathSync(resolved);
}

/** Returns one existing file only when its real path remains beneath the real root. */
function requiredFileWithin(root, value, label) {
	const realRoot = requiredDirectory(root, `${label}_root`);
	const resolved = path.resolve(String(value || ""));
	const stat = fs.statSync(resolved, { throwIfNoEntry: false });
	if (!stat?.isFile()) throw new Error(`${label}_file_required`);
	const realFile = fs.realpathSync(resolved);
	assertWithin(realRoot, realFile, label);
	return realFile;
}

/** Returns one destination path only when its real parent remains beneath the real root. */
function requiredPathWithin(root, value, label) {
	const realRoot = requiredDirectory(root, `${label}_root`);
	const resolved = path.resolve(String(value || ""));
	if (!value) throw new Error(`${label}_required`);
	const parent = fs.realpathSync(path.dirname(resolved));
	assertWithin(realRoot, parent, label);
	return path.join(parent, path.basename(resolved));
}

function assertWithin(root, candidate, label) {
	const relative = path.relative(root, candidate);
	if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) return;
	throw new Error(`${label}_outside_root`);
}

module.exports = {
	assertWithin,
	requiredDirectory,
	requiredFileWithin,
	requiredPathWithin
};
