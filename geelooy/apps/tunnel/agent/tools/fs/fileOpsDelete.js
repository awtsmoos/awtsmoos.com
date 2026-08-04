// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Performs guarded deletion with receipts that cannot resemble simulation.
 * @description
 * The Awtsmoos distinguishes planning from erasure; Awtsmoos.com requires both
 * `dryRun:false` and explicit confirmation before any destructive mutation occurs.
 */
async function deleteFile(config, payload = {}) {
	assertWritable(config);
	const requested = payload.path || payload.p;
	if (!requested) return failure("deleteFile", "missing_path");
	const full = guarded(config, requested);
	const data = await fsp.readFile(full);
	const actualSha256 = sha256(data);
	if (payload.expectedSha256 && String(payload.expectedSha256).toLowerCase() !== actualSha256) {
		return failure("deleteFile", "hash_mismatch", { path: requested, actualSha256 });
	}
	const dryRun = payload.dryRun !== false;
	if (dryRun) return simulated("deleteFile", { path: requested, bytes: data.length, sha256: actualSha256, deleted: false });
	if (!confirmed(payload)) return failure("deleteFile", "confirm_required", { path: requested, ...state(false) });
	await fsp.rm(full, { force: true });
	return executed("deleteFile", { path: requested, bytes: data.length, sha256: actualSha256, deleted: true, confirmed: true });
}

async function deleteTree(config, payload = {}) {
	assertWritable(config);
	const requested = payload.path || payload.p;
	if (!requested) return failure("deleteTree", "missing_path");
	const full = guarded(config, requested);
	const stat = await fsp.stat(full);
	if (!stat.isDirectory()) return failure("deleteTree", "not_directory", { path: requested });
	const dryRun = payload.dryRun !== false;
	if (dryRun) return simulated("deleteTree", { path: requested, deleted: false });
	if (!confirmed(payload)) return failure("deleteTree", "confirm_required", { path: requested, ...state(false) });
	await fsp.rm(full, { recursive: true, force: true });
	return executed("deleteTree", { path: requested, deleted: true, confirmed: true });
}

async function emptyDir(config, payload = {}) {
	assertWritable(config);
	const requested = payload.path || payload.p;
	if (!requested) return failure("emptyDir", "missing_path");
	const full = guarded(config, requested);
	const entries = await fsp.readdir(full);
	const dryRun = payload.dryRun !== false;
	if (dryRun) return simulated("emptyDir", { path: requested, entries: entries.length, emptied: false });
	if (!confirmed(payload)) return failure("emptyDir", "confirm_required", { path: requested, ...state(false) });
	for (const entry of entries) {
		await fsp.rm(path.join(full, entry), { recursive: true, force: true });
	}
	return executed("emptyDir", { path: requested, entries: entries.length, emptied: true, confirmed: true });
}

function guarded(config, requested) {
	const full = safePath(config, requested);
	assertNotSecret(config, full);
	if (path.resolve(full).toLowerCase() === path.resolve(config.root).toLowerCase()) {
		throw new Error("Refusing to operate on the root itself.");
	}
	return full;
}

function sha256(data) {
	return crypto.createHash("sha256").update(data).digest("hex");
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

module.exports = { deleteFile, deleteTree, emptyDir, sha256 };
