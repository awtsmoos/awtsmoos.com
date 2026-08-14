// B"H

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Persists native preview registrations outside the replaceable runtime.
 * @description
 * The Awtsmoos carries each local doorway across launcher and installer renewal.
 * Atomic writes, restrictive permissions, expiration, and revocation keep the
 * registry durable without turning old local ports into immortal public promises.
 */
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

function get(id, stateRoot) {
	return active(readState(stateRoot).previews[String(id || "")]) || null;
}

function list(stateRoot) {
	return Object.values(readState(stateRoot).previews)
		.map(active)
		.filter(Boolean)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

function stop(id, stateRoot) {
	const state = readState(stateRoot);
	const preview = state.previews[String(id || "")];
	if (!preview) return null;
	preview.status = "stopped";
	preview.revokedAt = new Date().toISOString();
	preview.updatedAt = preview.revokedAt;
	writeState(state, stateRoot);
	return preview;
}

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

function writeState(state, stateRoot) {
	const file = stateFile(stateRoot);
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
	fs.chmodSync(temporary, 0o600);
	fs.renameSync(temporary, file);
}

function stateFile(stateRoot) {
	const root = stateRoot || process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	return path.join(root, "state", "preview-registry.json");
}

function normalize(record) {
	const ttlSeconds = Math.max(60, Number(record.ttlSeconds || 3600));
	return {
		...record,
		ttlSeconds,
		expiresAt: record.expiresAt || Date.now() + ttlSeconds * 1000
	};
}

function active(preview) {
	if (!preview || preview.status !== "running") return null;
	if (Number(preview.expiresAt || 0) <= Date.now()) return null;
	return preview;
}

module.exports = {
	create,
	get,
	list,
	stateFile,
	stop
};
