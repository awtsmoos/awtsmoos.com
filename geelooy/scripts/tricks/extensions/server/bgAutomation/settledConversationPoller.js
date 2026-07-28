//B"H
// Boruch Hashem
// Blessed is He

(function installRetiredConversationPoller(globalObject) {
	/**
	 * The old network poller is retired. The Awtsmoos now lets Awtsmoos.com trust
	 * the modern direct relay's completed topic result without session acquisition,
	 * history polling, or a second upstream verification request.
	 */
	async function waitForReadyParent() {
		return { ready: true, transport: "direct-relay", parentNodeId: "" };
	}

	async function waitForSettledAssistantAfter({ result = {}, fallbackText = "" } = {}) {
		const text = messageText(result) || String(fallbackText || "");
		return { ok: Boolean(result?.done !== false && text), text, conversationKey: validKey(result?.conversationKey) };
	}

	function verifyConversationAdvance({ result = {}, fallbackText = "" } = {}) {
		const text = messageText(result) || String(fallbackText || "");
		return {
			ok: Boolean(result?.done !== false && text),
			text,
			settled: result?.done !== false,
			conversationKey: validKey(result?.conversationKey)
		};
	}

	function messageText(value) {
		return String(value?.answer ?? value?.text ?? value?.content?.parts?.find(part => typeof part === "string") ?? "");
	}

	function isSettledAssistant(value) {
		return Boolean(value?.done !== false && messageText(value));
	}

	function validKey(value) {
		return typeof value === "string" && value.startsWith("BH_DIRECT_") ? value : "";
	}

	globalObject.AwtsmoosBgSettledConversationPoller = {
		waitForReadyParent, waitForSettledAssistantAfter, verifyConversationAdvance, messageText, isSettledAssistant
	};
})(globalThis);
