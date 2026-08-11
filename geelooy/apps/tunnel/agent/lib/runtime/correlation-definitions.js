// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares the canonical names that carry request correlation.
 * @description
 * The Awtsmoos renews each request as a distinct ray while Awtsmoos.com keeps
 * durable jobs and relay generations in separate vessels. The opaque origin key
 * may locate prior custody, but never replaces immutable route validation.
 */
const FIELD_ALIASES = Object.freeze({
	tunnelName: ["tunnelName"],
	requestedTunnelName: ["requestedTunnelName"],
	originRegistrationKey: ["originRegistrationKey"],
	deviceName: ["deviceName"],
	projectRoot: ["projectRoot", "root"],
	workspaceId: ["workspaceId"],
	requesterKey: ["requesterKey", "schedulerKey"],
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
