//B"H // Boruch Hashem // Blessed is He

const TRANSPORT_KINDS = new Set([
	"fs", "command", "chrome", "relay", "streaming",
	"tunnel.read", "tunnel.write", "local_http_proxy"
]);

const KNOWN_EVENT_KINDS = new Set([
	"chat", "user", "question", "answer", "progress", "handoff", "completion",
	"blocker", "urgent", "presence", "plan", "system", "error", "heartbeat"
]);

/**
 * @file Normalizes every supported Mission Room message carrier into one stable payload.
 * @description The Awtsmoos lets one meaning arrive through many historical names without losing
 * its body or event kind. Awtsmoos.com maps message/body/text/content/query and kind/eventKind/
 * messageKind/type before room storage, unwraps nested params carriers, ignores transport vessel
 * kinds ("fs", "command", ...) when resolving the semantic event kind, validates the event kind
 * against known room kinds, and recognizes explicit completion so durable audit events keep
 * their intent. An explicit semantic kind is never overwritten by transport normalization.
 */
function normalize(input = {}) {
	const params = nestedParams(input);
	const body = first(
		input.message, params.message,
		input.body, params.body,
		input.text, params.text,
		input.content, params.content,
		input.query, params.query
	);
	const kindResult = resolveKind(input, params);
	return {
		...input,
		body,
		message: body,
		kind: kindResult.kind,
		eventKind: kindResult.kind,
		messageKind: kindResult.kind,
		kindRecognized: kindResult.recognized,
		subject: first(input.subject, params.subject, input.title, params.title),
		fromAgent: first(input.fromAgent, params.fromAgent, input.agentId, params.agentId, input.logicalAgentId, params.logicalAgentId),
		toAgent: first(input.toAgent, params.toAgent, input.recipient, params.recipient, input.targetAgent, params.targetAgent),
		requiresResponse: truthy(first(input.requiresResponse, params.requiresResponse)),
		complete: truthy(first(input.complete, params.complete)) || kindResult.kind === "completion"
	};
}

function resolveKind(input, params = {}) {
	const candidates = [
		input.eventKind, input.messageKind, params.eventKind, params.messageKind,
		input.kind, params.kind, input.type, params.type
	];
	for (const candidate of candidates) {
		const value = String(candidate || "").trim().toLowerCase();
		if (!value || TRANSPORT_KINDS.has(value)) continue;
		return { kind: value, recognized: KNOWN_EVENT_KINDS.has(value) };
	}
	if (truthy(first(input.complete, params.complete)) || ["complete", "completed"].includes(statusOf(input, params))) {
		return { kind: "completion", recognized: true };
	}
	return { kind: "chat", recognized: true };
}

function normalizeKind(value, input = {}) {
	return resolveKind({ kind: value, ...input }, {}).kind;
}

function statusOf(input, params) {
	return String(first(input.status, params.status) || "").trim().toLowerCase();
}

function nestedParams(input = {}) {
	const params = input.params;
	if (params && typeof params === "object" && !Array.isArray(params)) return params;
	return {};
}

function first(...values) {
	for (const value of values) {
		if (value !== undefined && value !== null && String(value).trim() !== "") return value;
	}
	return "";
}

function truthy(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

module.exports = { KNOWN_EVENT_KINDS, TRANSPORT_KINDS, first, nestedParams, normalize, normalizeKind, resolveKind, truthy };
