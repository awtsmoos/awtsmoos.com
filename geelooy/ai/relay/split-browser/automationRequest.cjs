//B"H
// Boruch Hashem
// Blessed is He

const { loadDirectService } = require("./directServiceLoader.cjs");

/**
 * One automation turn enters the same modern fallback service as `/direct-chat`.
 * The Awtsmoos lets Awtsmoos.com carry only bounded model fields and an opaque
 * continuation key; raw upstream identities and arbitrary payload expansion die.
 */
async function sendAutomationTurn(run, prompt, onProgress) {
	const service = await loadDirectService(run.config);
	const result = await service.send({
		...buildRequest(run, prompt),
		signal: run.abortController?.signal,
		timeoutMs: 180000,
		onProgress
	});
	const conversationKey = String(result.conversationKey || "");
	if (!conversationKey.startsWith("BH_DIRECT_")) {
		throw directError(
			"direct_conversation_key_missing",
			"The direct relay did not return an opaque continuation key."
		);
	}
	return {
		answer: String(result.answer || ""),
		conversationKey,
		timings: numericTimings(result.timings),
		hostReuseSource: result.hostReuseSource || "unknown"
	};
}

function buildRequest(run, prompt) {
	const modePayload = run.chatgptModePayload || {};
	const request = {
		prompt: String(prompt || ""),
		mode: "page-authorized-fallback",
		conversationKey: run.transportConversationKey || undefined,
		conversationMode: conversationMode(run.chatgptMode, modePayload)
	};
	copyText(request, "model", modePayload.model);
	copyText(request, "thinkingEffort", modePayload.thinkingEffort);
	return request;
}

function conversationMode(chatgptMode, modePayload) {
	const supplied = modePayload.conversationMode || modePayload.conversation_mode;
	if (supplied) {
		return supplied;
	}
	const gizmoId = modePayload.gizmo_id || modePayload.gizmoId || chatgptMode;
	if (/^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
		return { kind: "gizmo_interaction", gizmo_id: gizmoId };
	}
	return { kind: "primary_assistant" };
}

function copyText(target, name, value) {
	if (typeof value === "string" && value) {
		target[name] = value;
	}
}

function numericTimings(value) {
	if (!value || typeof value !== "object") {
		return null;
	}
	return Object.fromEntries(Object.entries(value)
		.filter(([, duration]) => Number.isFinite(Number(duration)))
		.map(([name, duration]) => [name, Number(duration)]));
}

function directError(code, safeHint) {
	const error = new Error(safeHint);
	error.code = code;
	error.safeHint = safeHint;
	return error;
}

module.exports = { sendAutomationTurn, buildRequest };
