// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares the canonical names that carry request correlation across v3 carriers.
 * @description
 * The Awtsmoos renews each request as one ray through many vessels; Awtsmoos.com keeps
 * request, control, session, and generation testimony together when params or params64
 * wrap the deed. No wrapper may erase the generation fence that makes a continuation one.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING v3ParamsIdentity.test.cjs
 * Historical symptom: params-only v3 calls preserved session/control identity but silently
 * lost requestId and generation before execution. Root cause: both fields were absent from
 * the shared correlation aliases. Forbidden simplification: action-specific identity copying.
 */
const FIELD_ALIASES = Object.freeze({
	tunnelName: ["tunnelName"],
	requestedTunnelName: ["requestedTunnelName"],
	originRegistrationKey: ["originRegistrationKey"],
	deviceName: ["deviceName"],
	projectRoot: ["projectRoot", "root"],
	workspaceId: ["workspaceId"],
	requesterKey: ["requesterKey", "schedulerKey"],
	requestId: ["requestId"],
	generation: ["generation"],
	agentSessionId: ["agentSessionId"],
	logicalAgentId: ["logicalAgentId", "agentId"],
	agentName: ["agentName"],
	conversationId: ["conversationId"],
	conversationName: ["conversationName"],
	missionId: ["missionId"],
	roomId: ["roomId"],
	leaseId: ["leaseId", "agentLeaseId"],
	workerId: ["workerId"],
	jobId: ["jobId"],
	stream: ["stream"],
	receiptId: ["receiptId"],
	actionId: ["actionId"],
	controlRequestId: ["controlRequestId", "requestId"],
	clientRequestId: ["clientRequestId", "requestId"],
	nonce: ["nonce"],
	cwd: ["cwd"],
	command: ["command"],
	parentActionId: ["parentActionId"],
	traceId: ["traceId", "correlationId"],
	spanId: ["spanId"],
	causalParentId: ["causalParentId"],
	startedAt: ["startedAt"],
	source: ["source"],
	correlationId: ["correlationId", "traceId"]
});

const CARRIER_KEYS = Object.freeze([
	"params",
	"params64",
	"payload",
	"payload64",
	"p",
	"body",
	"body64",
	"content",
	"content64",
	"input",
	"request",
	"browserRequest",
	"osRequest",
	"virtualOsRequest"
]);

const BASE64_KEYS = new Set([
	"params64",
	"payload64",
	"content64",
	"body64"
]);

const MAX_PARSE_CHARS = 256 * 1024;

module.exports = {
	BASE64_KEYS,
	CARRIER_KEYS,
	FIELD_ALIASES,
	MAX_PARSE_CHARS
};
