//B"H
// Boruch Hashem
// Blessed is He

(function installDirectAutomationSender(globalObject) {
	/**
	 * The Awtsmoos sends one explicit ChatGPT website turn through the local relay.
	 * Awtsmoos.com keeps its visible conversation label locally while only an opaque
	 * `BH_DIRECT_` continuation key crosses between automation turns.
	 */
	async function sendAndVerify(options = {}) {
		const request = makeBody(options);
		const result = await globalObject.AwtsmoosDirectRelayClient.chat(request, {
			signal: options.signal
		});
		const conversationKey = String(
			result.conversationKey || request.conversationKey || ""
		);
		if (!conversationKey.startsWith("BH_DIRECT_")) {
			throw safeError(
				"direct_conversation_key_missing",
				"The relay did not return an opaque continuation key."
			);
		}
		const text = globalObject.AwtsmoosBgStreamCompatibility.answerText(result);
		const final = {
			ok: true,
			text,
			answer: text,
			conversationKey,
			mode: result.mode || "chatgpt-website",
			done: result.done !== false,
			status: Number(result.status || 200),
			extensionRelayMs: Number(result.extensionRelayMs || 0),
			timings: result.timings || null
		};
		globalObject.AwtsmoosBgStreamCompatibility.emitFinal({
			result: final,
			conversationId: options.conversationId,
			onPacket: options.onPacket
		});
		return final;
	}

	function makeBody(options = {}) {
		const modePayload = options.chatgptModePayload || {};
		const request = {
			prompt: String(options.prompt || ""),
			mode: "chatgpt-website",
			conversationKey: options.conversationKey
				|| options.directConversationKey
				|| undefined
		};
		copyText(request, "model", options.model ?? modePayload.model);
		copyText(
			request,
			"thinkingEffort",
			options.thinkingEffort ?? modePayload.thinkingEffort
		);
		request.conversationMode = resolveConversationMode(
			options.chatgptMode,
			modePayload
		);
		return request;
	}

	function resolveConversationMode(chatgptMode, modePayload) {
		if (modePayload.conversationMode) return modePayload.conversationMode;
		const gizmoId = modePayload.gizmo_id || modePayload.gizmoId || chatgptMode;
		if (/^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
			return { kind: "gizmo_interaction", gizmo_id: gizmoId };
		}
		return { kind: "primary_assistant" };
	}

	function copyText(target, name, value) {
		if (typeof value === "string" && value) target[name] = value;
	}

	function safeError(code, safeHint) {
		const error = new Error(safeHint);
		error.code = code;
		error.safeHint = safeHint;
		error.awtsmoosSafeRelay = true;
		return error;
	}

	globalObject.AwtsmoosBgSendVerifier = {
		sendAndVerify,
		makeBody,
		parseChunk: globalObject.AwtsmoosBgStreamCompatibility.parseChunk,
		packetEvent: globalObject.AwtsmoosBgStreamCompatibility.terminalPacket,
		chatPacket: globalObject.AwtsmoosBgStreamCompatibility.chatPacket,
		compactPacket: globalObject.AwtsmoosBgStreamCompatibility.chatPacket
	};
})(globalThis);
