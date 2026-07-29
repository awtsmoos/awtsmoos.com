//B"H
// Boruch Hashem
// Blessed is He

(function installStreamCompatibility(globalObject) {
	/**
	 * The Awtsmoos turns one completed direct answer into the old visible rhythm:
	 * one honest terminal packet and one `[DONE]` seal. Awtsmoos.com receives no
	 * fabricated token deltas and no upstream conversation or message identity.
	 */
	function emitFinal({ result = {}, conversationId = "", onPacket = () => {}, startSequence = 0 } = {}) {
		const terminal = terminalPacket({ result, conversationId, sequence: startSequence + 1 });
		const done = donePacket({ result, conversationId, sequence: startSequence + 2 });
		onPacket(terminal);
		onPacket(done);
		return { terminal, done };
	}

	function terminalPacket({ result = {}, conversationId = "", sequence = 1 } = {}) {
		const text = answerText(result);
		return {
			phase: "packet",
			seq: Number(sequence || 1),
			terminal: true,
			text,
			conversationId: String(conversationId || ""),
			messageId: "",
			packet: chatPacket({ text, conversationId })
		};
	}

	function donePacket({ result = {}, conversationId = "", sequence = 2 } = {}) {
		return {
			phase: "done",
			seq: Number(sequence || 2),
			text: answerText(result),
			conversationId: String(conversationId || ""),
			messageId: "",
			packet: { dataNoJSON: "[DONE]" }
		};
	}

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

	function parseChunk(chunk, state = {}, onPacket = () => {}) {
		const parts = `${state.buffer || ""}${chunk || ""}`.split(/\r?\n\r?\n/);
		let next = { ...state, buffer: parts.pop() || "" };
		for (const block of parts) {
			const data = block.split(/\r?\n/).filter(line => line.startsWith("data:"))
				.map(line => line.slice(5).trimStart()).join("\n").trim();
			if (!data || data === "[DONE]") continue;
			const parsed = safeJson(data);
			if (!parsed) continue;
			const raw = parsed.data || parsed;
			const message = parsed.message || raw.message || {};
			const currentText = answerText({ message });
			const conversationId = parsed.conversation_id || raw.conversation_id || next.conversationId || "";
			const messageId = message.id || next.messageId || "";
			const seq = Number(next.seq || 0) + 1;
			next = {
				...next,
				seq,
				conversationId,
				messageId,
				text: currentText || next.text || ""
			};
			onPacket(packetEvent({ ...next, parsed, raw, message, currentText }));
		}
		return next;
	}

	function packetEvent(state = {}) {
		return {
			phase: "packet",
			seq: Number(state.seq || 0),
			terminal: false,
			text: state.currentText || state.text || "",
			conversationId: state.conversationId || "",
			messageId: state.messageId || "",
			packet: compactPacket(state)
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
			message: message.id || content || Object.keys(metadata).length ? stripUndefined({
				id: message.id || state.messageId || "",
				author: { role: message.author?.role || "assistant" },
				channel: message.channel || raw.channel || undefined,
				content: content || { content_type: raw.content_type || raw.type || "status" },
				metadata
			}) : undefined,
			metadata: Object.keys(metadata).length ? metadata : undefined
		});
	}

	function compactContent(content = {}) {
		if (!content || typeof content !== "object") return null;
		const compact = {};
		for (const key of ["content_type", "parts", "text", "thoughts", "tool_calls", "tool_call", "tool_result", "result", "output"]) {
			if (content[key] !== undefined) compact[key] = trimDeep(content[key]);
		}
		return Object.keys(compact).length ? compact : null;
	}

	function compactMetadata(value = {}) {
		if (!value || typeof value !== "object") return {};
		const compact = {};
		for (const key of ["reasoning_status", "is_thinking_preamble_message", "command", "tool_call_id", "call_id", "name", "status"]) {
			if (value[key] !== undefined) compact[key] = trimDeep(value[key]);
		}
		return compact;
	}

	function trimDeep(value) {
		if (typeof value === "string") return value.length > 4000 ? `${value.slice(0, 4000)}…` : value;
		if (Array.isArray(value)) return value.slice(0, 12).map(trimDeep);
		if (value && typeof value === "object") {
			return Object.fromEntries(Object.entries(value).slice(0, 24).map(([key, entry]) => [key, trimDeep(entry)]));
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
		return String(result?.answer ?? result?.text ?? result?.message?.content?.parts?.[0] ?? "");
	}

	function safeJson(text) {
		try {
			return JSON.parse(text);
		} catch {
			return null;
		}
	}

	globalObject.AwtsmoosBgStreamCompatibility = {
		emitFinal,
		terminalPacket,
		donePacket,
		chatPacket,
		parseChunk,
		packetEvent,
		compactPacket,
		answerText
	};
})(globalThis);
