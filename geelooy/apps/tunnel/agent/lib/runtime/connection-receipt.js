// B"H
// Boruch Hashem
// Blessed is He

const Async = require("./connection-receipt-async.js");
const Context = require("./connection-context-state.js");
const Runtime = require("./connection-receipt-runtime.js");
const Storage = require("./connection-receipt-storage.js");
const Value = require("./connection-receipt-value.js");
const { ROOT } = require("../config.js");

/**
 * @file Persists one connection covenant while distinguishing runtime from transport renewal.
 * @description
 * The Awtsmoos keeps testimony rooted while sockets appear and disappear; Awtsmoos.com
 * enriches every atomic receipt with stable contract identity and runtime incarnation,
 * allowing reconnect storms to heal without impersonating an install or process generation.
 */
function receiptPath(root = ROOT) {
	return Storage.receiptPath(root);
}

function read(root = ROOT) {
	const raw = Storage.readRaw(root);
	return raw ? Value.normalize(raw) : null;
}

function write(state, details = {}, root = ROOT) {
	const current = read(root) || {};
	const now = new Date().toISOString();
	const ownerPid = Number(
		details.ownerPid || process.env.AWTSMOOS_CONNECTION_OWNER_PID ||
		current.ownerPid || current.pid || process.pid
	);
	const activationId = String(
		process.env.AWTSMOOS_ACTIVATION_ID || current.activationId || ""
	);
	const runtimeVersion = Runtime.runtimeVersion(root, current);
	const transportGeneration = Number(
		details.transportGeneration ?? details.generation ?? current.transportGeneration ?? 0
	);
	const context = Context.receiptContext(current, details, {
		activationId,
		runtimeVersion,
		ownerPid
	});
	const receipt = Value.normalize({
		...current,
		...details,
		...context,
		state,
		pid: ownerPid,
		ownerPid,
		connectionPid: process.pid,
		activationId,
		runtimeVersion,
		generation: transportGeneration,
		transportGeneration,
		transportRevision: transportGeneration,
		reconnectStreak: Number(details.reconnectAttempt ?? current.reconnectAttempt ?? 0),
		reconnectStreakStartedAt: streakStart(state, current, now),
		updatedAt: now
	});
	if (state === "registered") {
		receipt.registeredAt = details.registeredAt || current.registeredAt || now;
	}
	Storage.writeRaw(root, receipt);
	return receipt;
}

function streakStart(state, current, now) {
	if (state === "registered") return null;
	if (state === "reconnecting") return current.reconnectStreakStartedAt || now;
	return current.reconnectStreakStartedAt || null;
}

function markServerSeen(details = {}, root = ROOT) {
	const current = read(root);
	if (!current || !Value.ownedByCurrentConnection(current) || current.state !== "registered") {
		return current;
	}
	return write("registered", {
		...details,
		registeredAt: current.registeredAt,
		lastServerMessageAt: new Date().toISOString()
	}, root);
}

module.exports = {
	FILE_NAME: Storage.FILE_NAME,
	SCHEMA_VERSION: Value.SCHEMA_VERSION,
	clear: (root = ROOT) => Storage.clear(root),
	markServerSeen,
	markServerSeenAsync: (details = {}, root = ROOT) =>
		Async.markServerSeen(root, Storage.FILE_NAME, details),
	matches: Value.matches,
	normalize: Value.normalize,
	ownedByCurrentConnection: Value.ownedByCurrentConnection,
	read,
	receiptPath,
	write
};
