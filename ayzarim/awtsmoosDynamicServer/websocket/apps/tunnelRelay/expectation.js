// B"H

const path = require("path");

const IDENTITY_KEYS = [
	"registrationKey",
	"tunnelName",
	"requestedTunnelName",
	"routeReference",
	"requestedAction",
	"expectedVessel",
	"controlRequestId",
	"clientRequestId",
	"agentSessionId",
	"logicalAgentId",
	"projectRoot",
	"nonce",
	"jobId",
	"stream",
	"cwd",
	"command"
];

function shouldCheckPath(action = "") {
	return /^(read|read64|readBytes|write|writeIfHash|stat|copy|move|delete|tree|list|find|grep|rg|touch|mkdirp|ensureFile|bulk|bulkWrite|bulkRead|readLines|readManyLines|connectedFiles|largeFiles|fileHashes|recentFiles)$/.test(String(action));
}

function cleanPathValue(value) {
	if (typeof value !== "string") return "";
	const trimmed = value.trim();
	return !trimmed || trimmed === "." ? "" : path.normalize(trimmed);
}

function requestedPaths(payload = {}, action = "") {
	if (!shouldCheckPath(action)) return [];
	const raw = [payload.path, payload.p, payload.absolutePath];
	if (/^(copy|move)$/.test(action)) raw.push(payload.source, payload.dest, payload.to, payload.from);
	if (/^(read|read64|readBytes|stat|write|writeIfHash|delete|touch|ensureFile)$/.test(action)) {
		raw.push(payload.source, payload.dest);
	}
	return raw.map(cleanPathValue).filter(Boolean);
}

function requestExpectation(id, name, payload = {}, timeoutMs) {
	const requestedAction = String(payload.action || "");
	const paths = requestedPaths(payload, requestedAction);
	return {
		id,
		tunnelName: name,
		requestedTunnelName: payload.requestedTunnelName || payload.tunnelName || name,
		routeReference: payload.routeReference || "",
		requestedAction,
		expectedVessel: payload.targetVessel || payload.vessel || "",
		expectedRouteReason: payload.targetVessel === "native-tunnel" ? "native" : "",
		controlRequestId: payload.controlRequestId || "",
		clientRequestId: payload.clientRequestId || "",
		agentSessionId: payload.agentSessionId || "",
		logicalAgentId: payload.logicalAgentId || "",
		projectRoot: payload.projectRoot || payload.root || "",
		nonce: payload.nonce || "",
		jobId: payload.jobId || payload.id || "",
		stream: payload.stream || "",
		cwd: payload.cwd || "",
		command: payload.command || "",
		path: paths[0] || "",
		paths,
		createdAt: Date.now(),
		timeoutMs
	};
}

function sameExpectation(left = {}, right = {}) {
	return IDENTITY_KEYS.every(key => String(left[key] || "") === String(right[key] || "")) &&
		JSON.stringify(left.paths || []) === JSON.stringify(right.paths || []);
}

module.exports = { cleanPathValue, requestExpectation, requestedPaths, sameExpectation, shouldCheckPath };
