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

	function chatPacket({ text = "", conversationId = "" } = {}) {
		return {
			conversation_id: String(conversationId || ""),
			message: {
				id: "",
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
			if (!data || data === "[DONE]") {
				continue;
			}
			const text = answerText(safeJson(data));
			if (!text) {
				continue;
			}
			next = { ...next, text, seq: Number(next.seq || 0) + 1 };
			onPacket(terminalPacket({ result: { answer: text }, sequence: next.seq }));
		}
		return next;
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
		emitFinal, terminalPacket, donePacket, chatPacket, parseChunk, answerText
	};
})(globalThis);
