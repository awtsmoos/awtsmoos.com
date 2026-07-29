//B"H
// Boruch Hashem
// Blessed is He

(function installDirectRelayPayload(globalObject) {
	/**
	 * The Awtsmoos gives every Awtsmoos.com relay request a narrow website vessel:
	 * real prompt, opaque continuation, and bounded public controls. No cookie,
	 * challenge value, upstream identity, or arbitrary body expansion crosses it.
	 */
	function normalizeDirectChatPayload(raw = {}) {
		const prompt = String(raw.prompt || "");
		if (!prompt.trim()) {
			throw payloadError("direct_prompt_required", "A non-empty prompt is required.");
		}
		const payload = {
			prompt,
			mode: "chatgpt-website"
		};
		const conversationKey = optionalText(raw.conversationKey, 200);
		if (conversationKey && !conversationKey.startsWith("BH_DIRECT_")) {
			throw payloadError("direct_conversation_key_invalid", "Continuation key must be opaque.");
		}
		if (conversationKey) payload.conversationKey = conversationKey;
		copyText(payload, "model", raw.model, 120);
		copyText(payload, "thinkingEffort", raw.thinkingEffort, 40);
		const conversationMode = normalizeConversationMode(raw.conversationMode);
		if (conversationMode) payload.conversationMode = conversationMode;
		return payload;
	}

	function normalizeConversationMode(value) {
		if (value == null) return null;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw payloadError("direct_conversation_mode_invalid", "Conversation mode is invalid.");
		}
		if (value.kind === "primary_assistant") {
			return { kind: "primary_assistant" };
		}
		const gizmoId = value.gizmo_id ?? value.gizmoId;
		if (value.kind === "gizmo_interaction" && /^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
			return { kind: value.kind, gizmo_id: gizmoId };
		}
		throw payloadError("direct_conversation_mode_invalid", "Conversation mode is unsupported.");
	}

	function copyText(target, name, value, maximumLength) {
		const normalized = optionalText(value, maximumLength);
		if (normalized) target[name] = normalized;
	}

	function optionalText(value, maximumLength) {
		if (value == null || value === "") return null;
		if (typeof value !== "string" || value.length > maximumLength) {
			throw payloadError("direct_payload_field_invalid", "Direct relay text field is invalid.");
		}
		return value;
	}

	function payloadError(code, message) {
		const error = new Error(message);
		error.code = code;
		return error;
	}

	globalObject.AwtsmoosDirectRelayPayload = { normalizeDirectChatPayload };
})(globalThis);
