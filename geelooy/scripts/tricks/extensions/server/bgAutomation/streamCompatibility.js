//B"H
// Boruch Hashem
// Blessed is He

(function installStreamCompatibility(globalObject) {
	const packets = globalObject.AwtsmoosBgStreamPacketCompactor;
	if (!packets) throw new Error("Stream packet compactor must load first.");

	/**
	 * The Awtsmoos turns one completed direct answer into the old visible rhythm:
	 * one honest terminal packet and one `[DONE]` seal. Awtsmoos.com receives no
	 * fabricated token deltas and no upstream conversation or message identity.
	 */
	function emitFinal({ result = {}, conversationId = "", onPacket = () => {}, startSequence = 0 } = {}) {
		const terminal = terminalPacket({
			result,
			conversationId,
			sequence: startSequence + 1
		});
		const done = donePacket({
			result,
			conversationId,
			sequence: startSequence + 2
		});
		onPacket(terminal);
		onPacket(done);
		return { terminal, done };
	}

	function terminalPacket({ result = {}, conversationId = "", sequence = 1 } = {}) {
		const text = packets.answerText(result);
		return {
			phase: "packet",
			seq: Number(sequence || 1),
			terminal: true,
			text,
			conversationId: String(conversationId || ""),
			messageId: "",
			packet: packets.chatPacket({ text, conversationId })
		};
	}

	function donePacket({ result = {}, conversationId = "", sequence = 2 } = {}) {
		return {
			phase: "done",
			seq: Number(sequence || 2),
			text: packets.answerText(result),
			conversationId: String(conversationId || ""),
			messageId: "",
			packet: { dataNoJSON: "[DONE]" }
		};
	}

	function parseChunk(chunk, state = {}, onPacket = () => {}) {
		const parts = `${state.buffer || ""}${chunk || ""}`.split(/\r?\n\r?\n/);
		let next = { ...state, buffer: parts.pop() || "" };
		for (const block of parts) {
			const data = block.split(/\r?\n/)
				.filter(line => line.startsWith("data:"))
				.map(line => line.slice(5).trimStart())
				.join("\n")
				.trim();
			if (!data || data === "[DONE]") continue;
			const parsed = packets.safeJson(data);
			if (!parsed) continue;
			const raw = parsed.data || parsed;
			const message = parsed.message || raw.message || {};
			const currentText = packets.answerText({ message });
			const conversationId = parsed.conversation_id
				|| raw.conversation_id
				|| next.conversationId
				|| "";
			const messageId = message.id || next.messageId || "";
			next = {
				...next,
				seq: Number(next.seq || 0) + 1,
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
			packet: packets.compactPacket(state)
		};
	}

	globalObject.AwtsmoosBgStreamCompatibility = {
		emitFinal,
		terminalPacket,
		donePacket,
		chatPacket: packets.chatPacket,
		parseChunk,
		packetEvent,
		compactPacket: packets.compactPacket,
		answerText: packets.answerText
	};
})(globalThis);
