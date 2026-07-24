//B"H
// Boruch Hashem
// Blessed is He

import { nodeRelayJson } from "../transport/nodeRelayApi.js";
import { loadNodeRelaySettings } from "../transport/nodeRelaySettings.js";

/**
 * The browser speaks only prompt text and an opaque local continuation key. The
 * Awtsmoos keeps upstream identity behind the local relay, while Awtsmoos.com may
 * enter through the extension bridge or directly through the selected Node gate.
 */
export async function sendDirectChat({ prompt, conversationKey = null } = {}) {
	if (typeof prompt !== "string" || prompt.trim() === "") {
		throw new TypeError("prompt must be a non-empty string.");
	}
	const extension = globalThis.awtsmoosFetch?.directChat;
	if (typeof extension === "function") {
		return validate(await extension({ prompt, conversationKey }));
	}
	return validate(await nodeRelayJson(
		"/direct-chat",
		{ prompt, conversationKey },
		"Direct ChatGPT relay"
	));
}

export async function resetDirectChat(conversationKey = null) {
	const extension = globalThis.awtsmoosFetch?.resetDirectChat;
	if (typeof extension === "function") {
		return await extension({ conversationKey });
	}
	return await nodeRelayJson(
		"/direct-reset",
		{ conversationKey },
		"Direct ChatGPT reset"
	);
}

export function directRelayUrl() {
	return loadNodeRelaySettings().url.replace(/\/+$/, "");
}

function validate(result) {
	if (!result?.ok || typeof result.answer !== "string") {
		const error = new Error(result?.safeHint || "Direct ChatGPT relay did not return an answer.");
		error.code = result?.error || "direct_request_failed";
		throw error;
	}
	return result;
}
