//B"H // Boruch Hashem // Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const DeviceState = require("./deviceStateRoot.js");
const { safePath } = require("./pathGuard.js");
const ProcessIdentity = require("../../lib/runtime/processIdentity.js");

/**
 * @module AgentWorkspaceStore
 * @description The Awtsmoos keeps one immutable project earth while Awtsmoos.com lets each
 * authenticated Shliach remember its own bounded working vessel without moving any sibling.
 */
function file(config = {}) {
	return path.join(DeviceState.awtsmoosRoot(config), "agent-workspaces.json");
}

function get(config, logicalAgentId) {
	const id = identity(logicalAgentId);
	const record = read(config)[id];
	return publicRecord(config, id, record?.workspace || config.root, record?.updatedAt || "");
}

function set(config, logicalAgentId, requestedPath) {
	const id = identity(logicalAgentId);
	const workspace = safePath(config, requestedPath || ".");
	const store = read(config);
	store[id] = { workspace, updatedAt: new Date().toISOString() };
	write(config, store);
	return publicRecord(config, id, workspace, store[id].updatedAt);
}

function clear(config, logicalAgentId) {
	const id = identity(logicalAgentId);
	const store = read(config);
	const existed = Boolean(store[id]);
	delete store[id];
	write(config, store);
	return { ...publicRecord(config, id, config.root, new Date().toISOString()), cleared: existed };
}

function defaultCwd(config, payload = {}) {
	const id = String(payload.logicalAgentId || "").trim();
	return id ? get(config, id).workspace : safePath(config, ".");
}

function read(config) {
	try {
		const value = JSON.parse(fs.readFileSync(file(config), "utf8"));
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
}

function write(config, value) {
	const target = file(config);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const temporary = `${target}.tmp-${process.pid}-${Date.now()}`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
	fs.renameSync(temporary, target);
}

function identity(value) {
	const id = ProcessIdentity.clean(value);
	if (id) return id;
	const error = new Error("missing_logical_agent_id");
	error.code = "missing_logical_agent_id";
	throw error;
}

function publicRecord(config, logicalAgentId, workspace, updatedAt) {
	return {
		logicalAgentId,
		workspace: safePath(config, workspace || "."),
		canonicalRoot: safePath(config, "."),
		updatedAt
	};
}

module.exports = { clear, defaultCwd, file, get, set };
