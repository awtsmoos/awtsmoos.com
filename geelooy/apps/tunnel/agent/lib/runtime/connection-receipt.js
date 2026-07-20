// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../config.js");

const SCHEMA_VERSION = 4;
const FILE_NAME = "connection-state.json";

/** Persists exact process, route, activation, version, and liveness testimony. */
function receiptPath(root = ROOT) {
	return path.join(root, FILE_NAME);
}

function read(root = ROOT) {
	try { return normalize(JSON.parse(fs.readFileSync(receiptPath(root), "utf8"))); }
	catch { return null; }
}

function write(state, details = {}, root = ROOT) {
	const current = read(root) || {};
	const now = new Date().toISOString();
	const receipt = normalize({
		...current,
		...details,
		state,
		pid: process.pid,
		activationId: process.env.AWTSMOOS_ACTIVATION_ID || current.activationId || "",
		runtimeVersion: process.env.AWTSMOOS_RUNTIME_VERSION || current.runtimeVersion || "",
		updatedAt: now
	});
	if (state === "registered") {
		receipt.registeredAt = details.registeredAt || current.registeredAt || now;
	}
	atomicWrite(receiptPath(root), receipt);
	return receipt;
}

function markServerSeen(details = {}, root = ROOT) {
	const current = read(root);
	if (!current || current.pid !== process.pid || current.state !== "registered") {
		return current;
	}
	return write("registered", {
		...details,
		registeredAt: current.registeredAt,
		lastServerMessageAt: new Date().toISOString()
	}, root);
}

function matches(receipt, options = {}) {
	if (!receipt || receipt.state !== "registered") return false;
	if (options.pid && Number(receipt.pid) !== Number(options.pid)) return false;
	if (options.tunnelName && receipt.tunnelName !== options.tunnelName) return false;
	if (options.tunnelId && receipt.tunnelId !== options.tunnelId) return false;
	if (options.activationId && receipt.activationId !== options.activationId) return false;
	if (options.runtimeVersion && receipt.runtimeVersion !== options.runtimeVersion) return false;
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const maxAgeMs = Number(options.maxAgeMs || 0);
	return !maxAgeMs || (
		Number.isFinite(timestamp) && Date.now() - timestamp >= 0 &&
		Date.now() - timestamp <= maxAgeMs
	);
}

function clear(root = ROOT) {
	try { fs.unlinkSync(receiptPath(root)); }
	catch (error) { if (error.code !== "ENOENT") throw error; }
}

function normalize(value = {}) {
	return {
		schemaVersion: SCHEMA_VERSION,
		state: String(value.state || "unknown"),
		pid: Number(value.pid || 0),
		tunnelId: String(value.tunnelId || ""),
		tunnelName: String(value.tunnelName || ""),
		agentVersion: String(value.agentVersion || ""),
		activationId: String(value.activationId || ""),
		runtimeVersion: String(value.runtimeVersion || ""),
		generation: Number(value.generation || 0),
		reconnectAttempt: Number(value.reconnectAttempt || 0),
		reconnectDelayMs: Number(value.reconnectDelayMs || 0),
		updatedAt: value.updatedAt || null,
		registeredAt: value.registeredAt || null,
		lastRegisteredAt: value.lastRegisteredAt || null,
		lastServerMessageAt: value.lastServerMessageAt || null,
		serverTime: value.serverTime || null,
		reason: String(value.reason || "")
	};
}

function atomicWrite(target, value) {
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

module.exports = {
	FILE_NAME,
	SCHEMA_VERSION,
	clear,
	markServerSeen,
	matches,
	normalize,
	read,
	receiptPath,
	write
};
