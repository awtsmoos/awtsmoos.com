// B"H
// Boruch Hashem
// Blessed is He

const SACRED_KEYS = Object.freeze([
	"requestId",
	"id",
	"action",
	"requestAction",
	"actualAction",
	"jobId",
	"correlationId",
	"clientRequestId",
	"controlRequestId",
	"nonce",
	"vessel",
	"workspaceId",
	"tunnelName",
	"cwd",
	"command",
	"path",
	"paths"
]);

/**
 * @file Preserves the outer request's identity across bounded inner continuation.
 * @description
 * The Awtsmoos may reveal many inner steps while Awtsmoos.com keeps one outer face.
 * This vessel gathers sacred correlation fields once, then restores them after each
 * mission continuation so a helper result never steals the requester's identity.
 */
function identity(payload = {}, data = {}, first = {}) {
	const action = String(payload.action || first.requestAction || first.action || "");
	return {
		requestId: payload.requestId || first.requestId || "",
		id: data.id || first.id || payload.id || "",
		action: action || first.action || "",
		requestAction: action || first.requestAction || first.action || "",
		actualAction: first.actualAction || action || first.action || "",
		jobId: first.jobId || payload.jobId || "",
		correlationId: payload.correlationId || first.correlationId || "",
		clientRequestId: payload.clientRequestId || first.clientRequestId || payload.requestId || "",
		controlRequestId: payload.controlRequestId || first.controlRequestId || payload.requestId || payload.id || "",
		nonce: payload.nonce || first.nonce || "",
		vessel: payload.vessel || first.vessel || "",
		workspaceId: payload.workspaceId || first.workspaceId || "",
		tunnelName: payload.tunnelName || first.tunnelName || "",
		cwd: first.cwd || payload.cwd || "",
		command: first.command || payload.command || "",
		path: first.path || payload.path || payload.p || "",
		paths: first.paths || payload.paths || undefined
	};
}

/**
 * Restores outer identity after an inner continuation returns its own metadata.
 * @param {object} output Result being returned to the original requester.
 * @param {object} first Original outer result.
 * @param {object} sacred Captured outer identity.
 * @returns {object} The same output with outer identity restored.
 */
function restoreIdentity(output, first = {}, sacred = {}) {
	for (const key of SACRED_KEYS) {
		const value = sacred[key] !== undefined ? sacred[key] : first[key];
		if (value !== undefined && value !== null && String(value) !== "") {
			output[key] = value;
		}
	}
	const request = String(
		output.requestAction || output.action || first.requestAction || first.action || ""
	);
	if (request) output.action = request;
	if (request) output.requestAction = request;
	if (!output.actualAction) output.actualAction = request || output.action || "";
	return output;
}

module.exports = {
	SACRED_KEYS,
	identity,
	restoreIdentity
};
