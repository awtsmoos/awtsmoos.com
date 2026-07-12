// B"H

/** B"H — Correlation names are declared once; carriers may reveal them later. */
const FIELD_ALIASES = Object.freeze({
	tunnelName: ['tunnelName'],
	requestedTunnelName: ['requestedTunnelName'],
	deviceName: ['deviceName'],
	projectRoot: ['projectRoot', 'root'],
	workspaceId: ['workspaceId'],
	agentSessionId: ['agentSessionId'],
	logicalAgentId: ['logicalAgentId', 'agentId'],
	agentName: ['agentName'],
	conversationId: ['conversationId'],
	conversationName: ['conversationName'],
	missionId: ['missionId'],
	roomId: ['roomId'],
	leaseId: ['leaseId', 'agentLeaseId'],
	workerId: ['workerId'],
	jobId: ['jobId'],
	receiptId: ['receiptId'],
	actionId: ['actionId'],
	controlRequestId: ['controlRequestId', 'requestId', 'id'],
	clientRequestId: ['clientRequestId', 'requestId'],
	nonce: ['nonce'],
	parentActionId: ['parentActionId'],
	traceId: ['traceId', 'correlationId'],
	spanId: ['spanId'],
	causalParentId: ['causalParentId'],
	startedAt: ['startedAt'],
	source: ['source'],
	correlationId: ['correlationId', 'traceId']
});

const CARRIER_KEYS = Object.freeze([
	'params',
	'params64',
	'payload',
	'payload64',
	'p',
	'body',
	'body64',
	'content',
	'content64',
	'input',
	'request',
	'browserRequest',
	'osRequest',
	'virtualOsRequest'
]);

const BASE64_KEYS = new Set(['params64', 'payload64', 'content64', 'body64']);
const MAX_PARSE_CHARS = 256 * 1024;

module.exports = { BASE64_KEYS, CARRIER_KEYS, FIELD_ALIASES, MAX_PARSE_CHARS };
