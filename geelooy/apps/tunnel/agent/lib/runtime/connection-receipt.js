// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Async = require("./connection-receipt-async.js");
const Value = require("./connection-receipt-value.js");
const { ROOT } = require("../config.js");

const FILE_NAME = "connection-state.json";

/**
	* @file Persists supervised owner and independent connection process testimony.
	* @description
	* The Awtsmoos keeps installer health bound to the parent while the child renews
	* liveness. Awtsmoos.com records both without confusing their responsibilities.
	*/
function receiptPath(root = ROOT) {
	return path.join(root, FILE_NAME);
}

function read(root = ROOT) {
	try {
		return Value.normalize(JSON.parse(fs.readFileSync(receiptPath(root), "utf8")));
	} catch {
		return null;
	}
}

function write(state, details = {}, root = ROOT) {
	const current = read(root) || {};
	const now = new Date().toISOString();
	const ownerPid = Number(
		details.ownerPid ||
		process.env.AWTSMOOS_CONNECTION_OWNER_PID ||
		current.ownerPid ||
		current.pid ||
		process.pid
	);
	const receipt = Value.normalize({
		...current,
		...details,
		state,
		pid: ownerPid,
		ownerPid,
		connectionPid: process.pid,
		activationId: process.env.AWTSMOOS_ACTIVATION_ID ||
			current.activationId || "",
		runtimeVersion: process.env.AWTSMOOS_RUNTIME_VERSION ||
			current.runtimeVersion || "",
		updatedAt: now
	});
	if (state === "registered") {
		receipt.registeredAt = details.registeredAt ||
			current.registeredAt || now;
	}
	atomicWrite(receiptPath(root), receipt);
	return receipt;
}

function markServerSeen(details = {}, root = ROOT) {
	const current = read(root);
	if (!current ||
		!Value.ownedByCurrentConnection(current) ||
		current.state !== "registered") {
		return current;
	}
	return write("registered", {
		...details,
		registeredAt: current.registeredAt,
		lastServerMessageAt: new Date().toISOString()
	}, root);
}

function markServerSeenAsync(details = {}, root = ROOT) {
	return Async.markServerSeen(root, FILE_NAME, details);
}

function clear(root = ROOT) {
	try {
		fs.unlinkSync(receiptPath(root));
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
}

function atomicWrite(target, value) {
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(
		temporary,
		`${JSON.stringify(value, null, 2)}\n`,
		{ mode: 0o600 }
	);
	fs.renameSync(temporary, target);
}

module.exports = {
	FILE_NAME,
	SCHEMA_VERSION: Value.SCHEMA_VERSION,
	clear,
	markServerSeen,
	markServerSeenAsync,
	matches: Value.matches,
	normalize: Value.normalize,
	ownedByCurrentConnection: Value.ownedByCurrentConnection,
	read,
	receiptPath,
	write
};
