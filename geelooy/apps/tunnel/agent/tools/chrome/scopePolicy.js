// B"H

function parameter(payload = {}, key, fallback = "") {
	return payload[key] ?? payload.params?.[key] ?? fallback;
}

function normalizedScope(payload = {}) {
	return {
		browserSessionId: String(parameter(payload, "browserSessionId", "") || ""),
		roomId: String(parameter(payload, "roomId", "") || ""),
		missionId: String(parameter(payload, "missionId", "") || ""),
		agentSessionId: String(parameter(payload, "agentSessionId", "") || ""),
		logicalAgentId: String(parameter(payload, "logicalAgentId", "") || "")
	};
}

function scopeKey(payload = {}) {
	return Object.values(normalizedScope(payload)).filter(Boolean).join("::");
}

function hasScope(payload = {}) {
	return Boolean(scopeKey(payload));
}

function scopeRequiredEnvelope(action, payload = {}) {
	return {
		BH: "B\"H",
		ok: false,
		action,
		status: 409,
		error: "missing_browser_scope",
		message: "Provide browserSessionId, roomId, missionId, agentSessionId, or logicalAgentId before acquiring a private Chrome target.",
		provided: normalizedScope(payload),
		nextSuggestedToolCall: {
			action: "chromeTargetAcquire",
			browserSessionId: "stable-session-id",
			url: parameter(payload, "url", "about:blank")
		}
	};
}

module.exports = { hasScope, normalizedScope, parameter, scopeKey, scopeRequiredEnvelope };
