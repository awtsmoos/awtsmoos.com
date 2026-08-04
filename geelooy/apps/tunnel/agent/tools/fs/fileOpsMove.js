// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Moves files and trees with explicit simulation testimony.
 * @description
 * The Awtsmoos distinguishes intention from mutation; Awtsmoos.com never lets a
 * dry-run receipt masquerade as a move that actually touched the filesystem.
 */
async function moveFile(config, payload = {}) {
	assertWritable(config);
	const from = payload.from || payload.source || payload.path || payload.p;
	const to = payload.to || payload.dest || payload.target;
	if (!from || !to) return failure("moveFile", "missing_from_or_to");
	const source = guarded(config, from);
	const destination = guarded(config, to);
	const stat = await fsp.stat(source);
	if (!stat.isFile()) return failure("moveFile", "source_not_file", { from, to });
	if (fs.existsSync(destination) && payload.overwrite !== true) {
		return failure("moveFile", "destination_exists", { from, to });
	}
	await fsp.mkdir(path.dirname(destination), { recursive: true });
	if (fs.existsSync(destination)) await fsp.rm(destination, { force: true });
	await fsp.rename(source, destination);
	return executed("moveFile", { from, to, bytes: stat.size, moved: true });
}

async function moveTree(config, payload = {}) {
	assertWritable(config);
	const from = payload.from || payload.source || payload.path || payload.p;
	const to = payload.to || payload.dest || payload.target;
	if (!from || !to) return failure("moveTree", "missing_from_or_to");
	const source = guarded(config, from, true);
	const destination = guarded(config, to);
	const stat = await fsp.stat(source);
	if (!stat.isDirectory()) return failure("moveTree", "source_not_directory", { from, to });
	const dryRun = payload.dryRun !== false;
	if (fs.existsSync(destination) && payload.overwrite !== true) {
		return failure("moveTree", "destination_exists", { from, to, ...state(dryRun) });
	}
	if (dryRun) return simulated("moveTree", { from, to, moved: false });
	if (!confirmed(payload)) return failure("moveTree", "confirm_required", { from, to, ...state(false) });
	await fsp.mkdir(path.dirname(destination), { recursive: true });
	if (fs.existsSync(destination)) await fsp.rm(destination, { recursive: true, force: true });
	await fsp.rename(source, destination);
	return executed("moveTree", { from, to, moved: true, confirmed: true });
}

function guarded(config, value, rejectRoot = false) {
	const full = safePath(config, value);
	assertNotSecret(config, full);
	if (rejectRoot && path.resolve(full).toLowerCase() === path.resolve(config.root).toLowerCase()) {
		throw new Error("Refusing to operate on the root itself.");
	}
	return full;
}

function assertWritable(config) {
	if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
}

function confirmed(payload) {
	return payload.confirm === true || payload.confirm === "true";
}

function state(dryRun) {
	return { dryRun, executionState: dryRun ? "simulated" : "executed", mutationApplied: !dryRun };
}

function simulated(action, extra) {
	return { ok: true, action, ...state(true), ...extra };
}

function executed(action, extra) {
	return { ok: true, action, ...state(false), ...extra };
}

function failure(action, error, extra = {}) {
	return { ok: false, action, error, ...extra };
}

module.exports = { moveFile, moveTree };
