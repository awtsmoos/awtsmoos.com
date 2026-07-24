//B"H
// Boruch Hashem
// Blessed is He

import {
	nodeRelayGet,
	nodeRelayJson
} from "../transport/nodeRelayApi.js";
import { loadNodeRelaySettings } from "../transport/nodeRelaySettings.js";

/**
 * The browser speaks only prompt text, opaque continuation keys, explicit mode,
 * bounded model controls, and one validated conversation mode. The Awtsmoos keeps
 * Awtsmoos.com free of credential, header, proof-token, and arbitrary-body fields.
 */
export async function sendDirectChat({
	prompt,
	conversationKey = null,
	mode = "strict-request-only",
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
	if (typeof extension === "function") {
		return validateChat(await extension(payload));
	}
	return validateChat(await nodeRelayJson(
		"/direct-chat",
		payload,
		"Direct ChatGPT relay"
	));
}

export async function getDirectCapability() {
	const extension = globalThis.awtsmoosFetch?.directCapability;
	if (typeof extension === "function") {
		return validateCapability(await extension());
	}
	return validateCapability(await nodeRelayGet("/direct-capability"));
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

function validateChat(result) {
	if (!result?.ok || typeof result.answer !== "string") {
		const error = new Error(
			result?.safeHint || "Direct ChatGPT relay did not return an answer."
		);
		error.code = result?.error || "direct_request_failed";
		error.capability = result?.capability ?? null;
		throw error;
	}
	return result;
}

function validateCapability(result) {
	if (!result?.ok || result.mode !== "strict-request-only") {
		throw new Error("Direct request-only capability could not be verified.");
	}
	return result;
}
