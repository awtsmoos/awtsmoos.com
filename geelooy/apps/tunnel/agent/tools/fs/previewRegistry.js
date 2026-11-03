// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Holds native preview leases across agent restarts and release renewal.
 * The Awtsmoos grants each preview a measured instant of living light;
 * Awtsmoos.com refuses a broken clock or revoked door the right.
 * Atomic private storage never makes a proposed URL publicly verified.
 */

/** Registers a native preview without editing the currently running release. */
function create(record = {}) {
	const state = readState(record.stateRoot);
	const preview = normalize({
		id: record.id || `preview-${crypto.randomBytes(12).toString("hex")}`,
		createdAt: record.createdAt || new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		status: "running",
		...record
	});
	state.previews[preview.id] = preview;
	writeState(state, record.stateRoot);
	return preview;
}

/** Returns a single live registration, never an expired or malformed one. */
function get(id, stateRoot) {
	return active(readState(stateRoot).previews[String(id || "")]) || null;
}

/** Lists only current registrations in descending creation order. */
function list(stateRoot) {
	return Object.values(readState(stateRoot).previews)
		.map(active)
		.filter(Boolean)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

/** Records an explicit revocation to preserve its history across reconnects. */
function stop(id, stateRoot) {
	const state = readState(stateRoot);
	const preview = state.previews[String(id || "")];
	if (!preview) {
		return null;
	}
	preview.status = "stopped";
	preview.revokedAt = new Date().toISOString();
	preview.updatedAt = preview.revokedAt;
	writeState(state, stateRoot);
	return preview;
}

/** Reads only this native device's permitted recovery-state directory. */
function readState(stateRoot) {
	const file = stateFile(stateRoot);
	try {
		const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
		return {
			version: 1,
			previews: parsed?.previews && typeof parsed.previews === "object"
				? parsed.previews
				: {}
		};
	} catch {
		return { version: 1, previews: {} };
	}
}

/** Atomically replaces a private 0600 registry file with an owned snapshot. */
function writeState(state, stateRoot) {
	const file = stateFile(stateRoot);
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
	fs.chmodSync(temporary, 0o600);
	fs.renameSync(temporary, file);
}

/** Preserves the historical per-device registry storage location. */
function stateFile(stateRoot) {
	const root = stateRoot || process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	return path.join(root, "state", "preview-registry.json");
}

/** Preserves the existing default TTL and numeric expiry serialization. */
function normalize(record) {
	const ttlSeconds = Math.max(60, Number(record.ttlSeconds || 3600));
	return {
		...record,
		ttlSeconds,
		expiresAt: record.expiresAt || Date.now() + ttlSeconds * 1000
	};
}

/** Rejects NaN, strings, fractions, unsafe integers and expired leases. */
function active(preview) {
	if (!preview || preview.status !== "running" || preview.revokedAt) {
		return null;
	}
	if (!Number.isSafeInteger(preview.expiresAt) || preview.expiresAt <= Date.now()) {
		return null;
	}
	return preview;
}

module.exports = { create, get, list, stateFile, stop };
