// B"H
const REQUIRED_REQUEST_FIELDS = Object.freeze([
	"tunnelName",
	"connectionEpoch",
	"transportSessionId",
	"controlRequestId",
	"clientRequestId",
	"nonce",
	"action",
	"root"
]);

const CORRELATION_FIELDS = Object.freeze([
	"tunnelName",
	"connectionEpoch",
	"transportSessionId",
	"controlRequestId",
	"clientRequestId",
	"nonce",
	"action",
	"root",
	"cwd",
	"missionId",
	"roomId",
	"logicalAgentId",
	"agentSessionId",
	"jobId",
	"streamId"
]);

/**
 * B"H — Identity is not inferred from the nearest living request. Every answer
 * must carry the names that prove its lineage, or it remains outside the gate.
 */
function validateRequest(input = {}) {
	const missing = REQUIRED_REQUEST_FIELDS.filter(field => !clean(input[field]));
	if (!Number.isSafeInteger(Number(input.connectionEpoch)) || Number(input.connectionEpoch) < 1) {
		missing.push("validConnectionEpoch");
	}
	return missing.length ? { ok: false, error: "invalid_request_identity", missing } : { ok: true };
}

function expectedFromRequest(request = {}) {
	return Object.fromEntries(CORRELATION_FIELDS
		.filter(field => request[field] !== undefined && request[field] !== "")
		.map(field => [field, scalar(request[field])]));
}

function compare(expected = {}, actual = {}) {
	const mismatches = [];
	for (const field of CORRELATION_FIELDS) {
		if (expected[field] === undefined || expected[field] === "") continue;
		if (scalar(actual[field]) !== scalar(expected[field])) {
			mismatches.push({ field, expected: scalar(expected[field]), actual: scalar(actual[field]) });
		}
	}
	return mismatches.length ? { ok: false, error: "correlation_mismatch", mismatches } : { ok: true };
}

function scalar(value) {
	if (value === undefined || value === null) return "";
	return String(value);
}

function clean(value) {
	return scalar(value).trim();
}

module.exports = {
	CORRELATION_FIELDS,
	REQUIRED_REQUEST_FIELDS,
	compare,
	expectedFromRequest,
	validateRequest
};
