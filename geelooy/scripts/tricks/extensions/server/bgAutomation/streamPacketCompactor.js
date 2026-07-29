//B"H
// Boruch Hashem
// Blessed is He

(function installStreamPacketCompactor(globalObject) {
	/**
	 * Compact compatibility packets retain visible text and bounded tool/status
	 * metadata. The Awtsmoos removes oversized, undefined, and private structure
	 * before legacy listeners receive one safe browser-extension mirror.
	 */
	function chatPacket({ text = "", conversationId = "", messageId = "" } = {}) {
		return {
			conversation_id: String(conversationId || ""),
			message: {
				id: String(messageId || ""),
				author: { role: "assistant" },
				content: { content_type: "text", parts: [String(text || "")] },
				metadata: { awtsmoos_compact_mirror: true, transport: "direct-relay" }
			}
		};
	}

	function compactPacket(state = {}) {
		if (String(state.currentText || "").trim()) {
			return chatPacket({
				text: state.currentText,
				conversationId: state.conversationId,
				messageId: state.messageId
			});
		}
		const raw = state.raw || state.parsed || {};
		const message = state.message || raw.message || {};
		const content = compactContent(message.content || raw.content || {});
		const metadata = compactMetadata(message.metadata || raw.metadata || {});
		return stripUndefined({
			type: raw.type || state.parsed?.type || "automation_stream_event",
			event: state.parsed?.event || raw.event || undefined,
			conversation_id: state.conversationId || raw.conversation_id || "",
			message: message.id || content || Object.keys(metadata).length
				? stripUndefined({
					id: message.id || state.messageId || "",
					author: { role: message.author?.role || "assistant" },
					channel: message.channel || raw.channel || undefined,
					content: content || {
						content_type: raw.content_type || raw.type || "status"
					},
					metadata
				})
				: undefined,
			metadata: Object.keys(metadata).length ? metadata : undefined
		});
	}

	function compactContent(content = {}) {
		if (!content || typeof content !== "object") return null;
		const compact = {};
		const keys = [
			"content_type", "parts", "text", "thoughts", "tool_calls",
			"tool_call", "tool_result", "result", "output"
		];
		for (const key of keys) {
			if (content[key] !== undefined) compact[key] = trimDeep(content[key]);
		}
		return Object.keys(compact).length ? compact : null;
	}

	function compactMetadata(value = {}) {
		if (!value || typeof value !== "object") return {};
		const compact = {};
		const keys = [
			"reasoning_status", "is_thinking_preamble_message", "command",
			"tool_call_id", "call_id", "name", "status"
		];
		for (const key of keys) {
			if (value[key] !== undefined) compact[key] = trimDeep(value[key]);
		}
		return compact;
	}

	function trimDeep(value) {
		if (typeof value === "string") {
			return value.length > 4000 ? `${value.slice(0, 4000)}…` : value;
		}
		if (Array.isArray(value)) return value.slice(0, 12).map(trimDeep);
		if (value && typeof value === "object") {
			return Object.fromEntries(Object.entries(value).slice(0, 24)
				.map(([key, entry]) => [key, trimDeep(entry)]));
		}
		return value;
	}

	function stripUndefined(value) {
		for (const key of Object.keys(value)) {
			if (value[key] === undefined) delete value[key];
		}
		return value;
	}

	function answerText(result = {}) {
		return String(
			result?.answer ?? result?.text ?? result?.message?.content?.parts?.[0] ?? ""
		);
	}

	function safeJson(text) {
		try {
			return JSON.parse(text);
		} catch {
			return null;
		}
	}

	globalObject.AwtsmoosBgStreamPacketCompactor = {
		chatPacket,
		compactPacket,
		answerText,
		safeJson
	};
})(globalThis);
