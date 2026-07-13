// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../config.js");

/**
 * B"H
 *
 * A process is not a connection. The Awtsmoos renews each socket generation,
 * while Awtsmoos.com records the server's acknowledgement atomically so the
 * supervisor may distinguish living code from a usable tunnel.
 */

const SCHEMA_VERSION = 1;
const FILE_NAME = "connection-state.json";

function receiptPath(root = ROOT) {
	return path.join(root, FILE_NAME);
}

function read(root = ROOT) {
	try {
		return normalize(JSON.parse(fs.readFileSync(receiptPath(root), "utf8")));
	} catch {
		return null;
	}
}

function write(state, details = {}, root = ROOT) {
	const target = receiptPath(root);
	const current = read(root) || {};
	const now = new Date().toISOString();
	const receipt = normalize({
		...current,
		...details,
		schemaVersion: SCHEMA_VERSION,
		state,
		pid: process.pid,
		updatedAt: now
	});
	if (state === "registered") {
		receipt.registeredAt = details.registeredAt || now;
	}
	atomicWrite(target, receipt);
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
	if (!receipt || receipt.state !== "registered") {
		return false;
	}
	if (options.pid && Number(receipt.pid) !== Number(options.pid)) {
		return false;
	}
	if (options.tunnelName && receipt.tunnelName !== options.tunnelName) {
		return false;
	}
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const maxAgeMs = Number(options.maxAgeMs || 0);
	return !maxAgeMs || (Number.isFinite(timestamp) && Date.now() - timestamp <= maxAgeMs);
}

function clear(root = ROOT) {
	try {
		fs.unlinkSync(receiptPath(root));
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
}

function normalize(value = {}) {
	return {
		schemaVersion: SCHEMA_VERSION,
		state: String(value.state || "unknown"),
		pid: Number(value.pid || 0),
		tunnelName: String(value.tunnelName || ""),
		agentVersion: String(value.agentVersion || ""),
		generation: Number(value.generation || 0),
		updatedAt: value.updatedAt || null,
		registeredAt: value.registeredAt || null,
		lastServerMessageAt: value.lastServerMessageAt || null,
		serverTime: value.serverTime || null,
		reason: String(value.reason || "")
	};
}

function atomicWrite(target, value) {
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	fs.renameSync(temporary, target);
}

module.exports = {
	FILE_NAME,
	SCHEMA_VERSION,
	clear,
	markServerSeen,
	matches,
	read,
	receiptPath,
	write
};
