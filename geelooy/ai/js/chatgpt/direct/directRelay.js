//B"H
// Boruch Hashem
// Blessed is He

import { nodeRelayGet, nodeRelayJson } from "../transport/nodeRelayApi.js";
import { loadNodeRelaySettings } from "../transport/nodeRelaySettings.js";

/**
 * The browser sends only the real prompt, an opaque local continuation key, and
 * bounded website controls. The Awtsmoos keeps cookies, account state, challenges,
 * request bodies, and upstream conversation ids inside the authenticated relay.
 */
export async function sendDirectChat({
	prompt,
	conversationKey = null,
	mode = "chatgpt-website",
	model = null,
	thinkingEffort = null,
	conversationMode = null
} = {}) {
	if (typeof prompt !== "string" || prompt.trim() === "") {
		throw new TypeError("prompt must be a non-empty string.");
	}
	const payload = {
		prompt,
		conversationKey,
		mode,
		model,
		thinkingEffort,
		conversationMode
	};
	const extension = globalThis.awtsmoosFetch?.directChat;
	const result = typeof extension === "function"
		? await extension(payload)
		: await nodeRelayJson("/direct-chat", payload, "ChatGPT website relay");
	return validateChat(result);
}

export async function getDirectCapability() {
	const extension = globalThis.awtsmoosFetch?.directCapability;
	const result = typeof extension === "function"
		? await extension()
		: await nodeRelayGet("/direct-capability");
	return validateCapability(result);
}

export async function resetDirectChat(conversationKey = null) {
	const extension = globalThis.awtsmoosFetch?.resetDirectChat;
	if (typeof extension === "function") return await extension({ conversationKey });
	return await nodeRelayJson(
		"/direct-reset",
		{ conversationKey },
		"ChatGPT website reset"
	);
}

export function directRelayUrl() {
	return loadNodeRelaySettings().url.replace(/\/+$/, "");
}

function validateChat(result) {
	if (!result?.ok || typeof result.answer !== "string") {
		const error = new Error(result?.safeHint || "ChatGPT website did not return an answer.");
		error.code = result?.error || "chatgpt_website_request_failed";
		throw error;
	}
	return result;
}

function validateCapability(result) {
	if (!result?.ok || result.mode !== "chatgpt-website" || result.websiteOnly !== true) {
		throw new Error("ChatGPT website capability could not be verified.");
	}
	return result;
}
