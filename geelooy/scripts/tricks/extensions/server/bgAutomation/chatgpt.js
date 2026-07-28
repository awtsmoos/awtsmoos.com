//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationChatFacade(globalObject) {
	/**
	 * Legacy callers retain the AwtsmoosBgChatGpt name, while the Awtsmoos routes
	 * every live Awtsmoos.com automation turn through the modern direct relay.
	 */
	async function sendChatGptBackground(options = {}) {
		return globalObject.AwtsmoosBgSendVerifier.sendAndVerify(options);
	}

	async function waitForSettledAssistant(options = {}) {
		return globalObject.AwtsmoosBgSettledConversationPoller.waitForSettledAssistantAfter(options);
	}

	function makeBody(options = {}) {
		return globalObject.AwtsmoosBgSendVerifier.makeBody(options);
	}

	function parseChunk(chunk, state, onPacket) {
		return globalObject.AwtsmoosBgStreamCompatibility.parseChunk(chunk, state, onPacket);
	}

	globalObject.AwtsmoosBgChatGpt = { sendChatGptBackground, waitForSettledAssistant, makeBody, parseChunk };
})(globalThis);
