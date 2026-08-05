// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes one website request and its private queue metadata.
 * @description
 * The Awtsmoos carries only coordination names into the global queue. Awtsmoos.com
 * extracts one stable mission-turn identity while prompts, answers, cookies, and
 * upstream conversation bodies remain outside the public coordination snapshot.
 */
export function requestFor(service, options = {}) {
	return {
		...options,
		closeAfterTurn: options.closeAfterTurn !== false,
		conversationMode: service.conversationModePolicy.normalize(
			options.conversationMode
		)
	};
}

export function queueMetadata(options = {}, kind) {
	return {
		kind,
		signal: options.signal,
		queueTimeoutMs: options.queueTimeoutMs,
		missionId: options.missionId,
		websiteMissionId: options.websiteMissionId,
		logicalAgentId: options.logicalAgentId,
		agentSessionId: options.agentSessionId,
		idempotencyKey: options.idempotencyKey || stableTurnIdentity(options.prompt)
	};
}

export function stableTurnIdentity(prompt) {
	const match = String(prompt || "").match(/^Stable turn identity:\s*(.+)$/mi);
	return match ? String(match[1]).trim().slice(0, 512) : "";
}

export function validatePrompt(prompt) {
	if (typeof prompt !== "string" || prompt.trim() === "") {
		throw new TypeError("prompt must be a non-empty string.");
	}
}

export function validateMode(mode) {
	const allowed = [
		"chatgpt-website",
		"page-authorized-fallback",
		"strict-request-only"
	];
	if (!allowed.includes(mode)) {
		throw new TypeError(`Unsupported direct mode: ${mode}.`);
	}
}

export function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
