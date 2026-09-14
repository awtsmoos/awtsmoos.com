//B"H
//Boruch Hashem
//Blessed be He

const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { readCurrentConversation } = require("../conversations/current.js");
const { sendPrompt } = require("../runtime/sendPrompt.js");
const { waitForResponse } = require("../runtime/waitForResponse.js");
const Defaults = require("../continuation/defaults.js");
const Policy = require("./messagePolicy.js");

/**
 * @file Sends one ChatGPT message through the device-owned Shared AI Browser.
 * @description
 * The browser opening result is the transport authority. A stale caller port
 * can never survive browser preparation into authentication or physical Send.
 */
async function chatgptMessage(payload = {}) {
	const targetUrl = Policy.conversationUrl(payload) || payload.url || "https://chatgpt.com/";
	const opened = await ensureProfileChrome({
		...payload,
		url: targetUrl,
		navigate: true
	});
	const port = Number(opened.port || opened.debugPort || 0);
	if (!port) return Policy.browserUnavailable();
	const session = await checkedSession(payload, port);
	if (!session.session?.authenticated && Policy.transportName(payload) !== "visible") {
		return Policy.notAuthenticated(session);
	}
	const response = await Policy.senderFor(payload, sendVisibleUiMessage)({
		...payload,
		port,
		url: targetUrl
	});
	const current = await readCurrentConversation({ ...payload, port }).catch(error => ({
		ok: false,
		error: error.message
	}));
	const out = {
		ok: response.ok !== false,
		action: "chatgptMessage",
		transport: response.transport || Policy.transportName(payload),
		port,
		sent: response.sent || response.prompt?.result || null,
		response: Policy.compactResponse(response),
		conversation: current,
		text: response.text || ""
	};
	return payload.compact === false ? { ...out, response } : out;
}

/** Reads ChatGPT login state from the same port returned by browser preparation. */
async function checkedSession(payload, port) {
	return sessionCheck({ ...payload, port }).catch(error => ({
		ok: false,
		error: error.message,
		session: { authenticated: false }
	}));
}
/** Sends through the living visible composer and optionally returns after submission. */
async function sendVisibleUiMessage(payload = {}) {
	const prompt = await sendPrompt(payload);
	if (!prompt.ok) {
		return {
			ok: false,
			transport: "visible-ui",
			error: prompt.error || "composer_send_failed",
			prompt
		};
	}
	if (payload.awaitResponse === false || payload.shortCycle === true) {
		return {
			ok: true,
			transport: "visible-ui",
			submitted: true,
			sent: prompt.result || prompt,
			text: "",
			wait: null,
			legalMode: true
		};
	}
	const waited = await waitForResponse({
		...payload,
		timeoutMs: Defaults.shortTimeout(payload.timeoutMs),
		settleMs: Defaults.settleMs(payload.settleMs)
	});
	return {
		ok: waited.ok !== false,
		transport: "visible-ui",
		sent: prompt.result || prompt,
		text: waited.text || "",
		wait: waited,
		legalMode: true,
		note: "Sent through the visible ChatGPT browser UI."
	};
}

module.exports = {
	chatgptMessage,
	sendVisibleUiMessage
};
