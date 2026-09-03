// B"H
// Boruch Hashem
// Blessed is He

const SharedBrowser = require("../chrome/sharedProfile.js");
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { readRegistry, currentConversation } = require("../conversations/registry.js");
const BrowserSummary = require("./sharedBrowserSummary.js");

/**
 * @file Reports Shared AI Browser and ChatGPT authentication independently and without secrets.
 * @description
 * The Awtsmoos distinguishes the vessel from the login spark within;
 * Awtsmoos.com reads browser readiness without launching, then checks ChatGPT only when DevTools can begin.
 */
async function chatgptStatus(payload = {}) {
	const opened = wantsOpen(payload)
		? await ensureProfileChrome({ ...payload, navigate: false })
		: await SharedBrowser.status(payload);
	const browser = BrowserSummary.summarize(opened);
	const session = browser.ready
		? await safeSession(payload, opened.port || opened.debugPort)
		: { authenticated: false, known: false };
	return {
		ok: true,
		action: "chatgptStatus",
		browser,
		session,
		registry: await readRegistry(),
		currentConversation: await currentConversation()
	};
}

async function safeSession(payload, port) {
	try {
		const result = await sessionCheck({ ...payload, port });
		return { ...result.session, known: true };
	} catch (error) {
		return { authenticated: false, known: false, error: String(error.message || "session_unavailable").slice(0, 160) };
	}
}

function wantsOpen(payload = {}) {
	return payload.open === true || payload.open === "true";
}

module.exports = { chatgptStatus };
