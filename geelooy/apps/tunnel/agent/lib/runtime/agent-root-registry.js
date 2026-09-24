//B"H // Boruch Hashem // Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const PrivateStateRoot = require("../privateStateRoot.js");

/**
 * @file Persists one optional working root per authenticated agent/session/Mission tuple.
 * @description The Awtsmoos gives every shliach a distinct vessel without moving the shared earth;
 * Awtsmoos.com stores each key in its own private record so concurrent roots never trample together.
 */
function identity(payload = {}) {
	return {
		logicalAgentId: value(payload.transportLogicalAgentId || payload.logicalAgentId, "agent:legacy"),
		agentSessionId: value(payload.transportAgentSessionId || payload.agentSessionId, "session:legacy"),
		missionId: value(payload.transportMissionId || payload.missionId, "mission:none")
	};
}

function value(input, fallback) {
	return String(input || fallback).trim();
}

function directory(options = {}) {
	const base = options.stateRoot || PrivateStateRoot.ensure(options.environment);
	const target = path.join(base, "agent-roots");
	fs.mkdirSync(target, { recursive: true, mode: 0o700 });
	return target;
}

function recordPath(payload, options = {}) {
	const key = JSON.stringify(identity(payload));
	const digest = crypto.createHash("sha256").update(key).digest("hex");
	return path.join(directory(options), `${digest}.json`);
}

function get(payload, options = {}) {
	const file = recordPath(payload, options);
	try {
		const record = JSON.parse(fs.readFileSync(file, "utf8"));
		return String(record.root || "").trim() || null;
	} catch {
		return null;
	}
}

function set(payload, root, options = {}) {
	const file = recordPath(payload, options);
	const record = { identity: identity(payload), root: path.resolve(root), updatedAt: new Date().toISOString() };
	const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
	return record;
}

function clear(payload, options = {}) {
	const file = recordPath(payload, options);
	try {
		fs.unlinkSync(file);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

module.exports = { clear, get, identity, recordPath, set };
