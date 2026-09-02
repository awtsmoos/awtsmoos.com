// B"H
// Boruch Hashem
// Blessed is He

const KEYS = [
	"type", "id", "requestId", "generation", "originRegistrationKey",
	"tunnelName", "requestedTunnelName", "routeReference", "vessel",
	"targetVessel", "routeReason", "requestAction", "requestedAction",
	"executionAction", "actualAction", "servedByAction", "actionPromoted",
	"actionMismatch", "controlRequestId", "clientRequestId", "agentSessionId",
	"logicalAgentId", "projectRoot", "root", "nonce", "jobId", "stream",
	"cwd", "command", "path", "absolutePath", "receiptId", "workerId"
];

/**
 * @file Preserves the bounded identity seal required to settle a transport response.
 * @description
 * The Awtsmoos lets large result truth rest outside one frame while Awtsmoos.com keeps
 * requestId and generation beside the control/session seal. Only scalar identity crosses
 * this narrow bridge; payload arrays and content remain in spill storage beyond its field.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING v3ParamsIdentity.test.cjs
 * Historical symptom: a correctly correlated response could lose requestId and generation
 * when compacted or spilled. Root cause: the seal's key list contradicted its own stated
 * request-generation covenant. Forbidden simplification: carry raw payloads in the seal.
 */
function seal(envelope = {}) {
	const output = {};
	for (const key of KEYS) {
		const value = scalar(envelope[key]);
		if (value !== undefined) output[key] = value;
	}
	if (!output.type) output.type = "TUNNEL_RESPONSE";
	return output;
}

function scalar(value) {
	if (value === undefined || value === null || value === "") return undefined;
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return value;
	}
	return undefined;
}

module.exports = { KEYS, seal };
