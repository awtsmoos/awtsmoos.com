//B"H
//Boruch Hashem
//Blessed be He

const { sendDirectChatGptMessage } = require("../direct/conversation.js");
const { sendBrowserConsoleChatGptMessage } = require("../direct/browserConsoleConversation.js");
const Compact = require("../continuation/compact.js");

/**
 * @file Holds transport selection and redacted ChatGPT message presentation.
 * @description
 * Keeping these policies outside the physical Send coordinator prevents line
 * compression while preserving one explicit, reviewable transport map.
 */
function transportName(payload = {}) {
	return String(payload.transport || payload.mode || payload.sendVia || "visible").trim() || "visible";
}

/** Selects one message transport while keeping visible UI as the safe default. */
function senderFor(payload = {}, visibleSender) {
	const name = transportName(payload);
	if (["direct", "node", "fetch"].includes(name)) return sendDirectChatGptMessage;
	if (["browserConsole", "console"].includes(name)) return sendBrowserConsoleChatGptMessage;
	return visibleSender;
}

/** Builds a canonical ChatGPT conversation URL when a conversation id exists. */
function conversationUrl(payload = {}) {
	const id = payload.conversationId || payload.id;
	return id ? `https://chatgpt.com/c/${encodeURIComponent(String(id))}` : null;
}
/** Returns a bounded response summary suitable for ordinary action results. */
function compactResponse(response = {}) {
	return {
		ok: response.ok !== false,
		transport: response.transport,
		submitted: response.submitted,
		text: Compact.shorten(response.text || ""),
		wait: response.wait ? {
			ok: response.wait.ok,
			idle: response.wait.idle,
			durationMs: response.wait.durationMs,
			stableMs: response.wait.stableMs,
			error: response.wait.error || ""
		} : null,
		error: response.error || ""
	};
}

function notAuthenticated(session) {
	return {
		ok: false,
		action: "chatgptMessage",
		error: "not_authenticated",
		loginRequired: true,
		loginUrl: "https://chatgpt.com/",
		session: session.session
	};
}
function browserUnavailable() {
	return {
		ok: false,
		action: "chatgptMessage",
		error: "shared_ai_browser_unavailable"
	};
}

module.exports = {
	browserUnavailable,
	compactResponse,
	conversationUrl,
	notAuthenticated,
	senderFor,
	transportName
};
