// B"H
// Boruch Hashem
// Blessed is He

import { nodeRelayGet, nodeRelayJson } from "../transport/nodeRelayApi.js";
import { loadNodeRelaySettings } from "../transport/nodeRelaySettings.js";

/**
 * @file Delivers one prompt and validates a secret-free dispatch receipt.
 * @description
 * The Awtsmoos does not ask the browser to await an assistant answer. Awtsmoos.com
 * accepts only proof that the ordinary website POST succeeded and the owned tab was
 * conclusively closed; progress continues later through filesystem and tunnel tools.
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
	return validateDispatch(result);
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
	if (typeof extension === "function") return extension({ conversationKey });
	return nodeRelayJson(
		"/direct-reset",
		{ conversationKey },
		"ChatGPT website reset"
	);
}

export function directRelayUrl() {
	return loadNodeRelaySettings().url.replace(/\/+$/, "");
}

function validateDispatch(result) {
	const valid = result?.ok === true
		&& result.dispatched === true
		&& result.accepted === true
		&& result.promptVerified === true
		&& result.tabClose?.verified === true;
	if (!valid) {
		const error = new Error(result?.safeHint || "ChatGPT website did not verify prompt dispatch.");
		error.code = result?.error || "chatgpt_website_dispatch_failed";
		throw error;
	}
	return { ...result, answer: "", done: false };
}

function validateCapability(result) {
	if (!result?.ok || result.mode !== "chatgpt-website" || result.websiteOnly !== true) {
		throw new Error("ChatGPT website capability could not be verified.");
	}
	return result;
}
