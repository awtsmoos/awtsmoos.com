// B"H
const crypto = require("node:crypto");

/**
 * B"H — A command receives one immutable lineage before a shell receives breath.
 * The hash contains execution meaning, while logs expose only the digest and
 * redacted ownership needed to prove which shliach asked for which work.
 */
function buildIdentity(input = {}) {
	const command = required(input.command, "missing_command");
	const tunnelName = required(input.tunnelName, "missing_tunnel_name");
	const ownerId = required(input.ownerId || input.logicalAgentId, "missing_owner_id");
	const root = required(input.root, "missing_root");
	const cwd = required(input.cwd || root, "missing_cwd");
	const shell = String(input.shell || "/bin/sh");
	const canonical = canonicalString({ command, cwd, shell, root, ownerId });
	const requestHash = sha256(canonical);
	const idempotencyKey = String(input.idempotencyKey || "").trim();
	const jobId = idempotencyKey
		? `cmd_${sha256(`${tunnelName}:${idempotencyKey}`).slice(0, 28)}`
		: `cmd_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
	return {
		jobId,
		requestHash,
		idempotencyHash: idempotencyKey ? sha256(idempotencyKey) : "",
		tunnelName,
		ownerId,
		missionId: clean(input.missionId),
		roomId: clean(input.roomId),
		logicalAgentId: clean(input.logicalAgentId || ownerId),
		agentSessionId: clean(input.agentSessionId),
		controlRequestId: clean(input.controlRequestId),
		clientRequestId: clean(input.clientRequestId),
		root,
		cwd,
		shell,
		command
	};
}

function sameRequest(record = {}, identity = {}) {
	return record.requestHash === identity.requestHash &&
		record.idempotencyHash === identity.idempotencyHash;
}

function canonicalString(value) {
	return JSON.stringify(sortValue(value));
}

function sortValue(value) {
	if (Array.isArray(value)) return value.map(sortValue);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortValue(value[key])]));
}

function sha256(value) {
	return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function required(value, code) {
	const text = String(value || "").trim();
	if (!text) throw failure(code);
	return text;
}

function clean(value) {
	return String(value || "").trim();
}

function failure(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { buildIdentity, canonicalString, sameRequest, sha256 };
