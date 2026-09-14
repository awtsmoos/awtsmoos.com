//B"H
//Boruch Hashem
//Blessed be He

const SharedBrowser = require("../chrome/sharedProfile.js");
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const { readRegistry, currentConversation } = require("../conversations/registry.js");
const BrowserSummary = require("./sharedBrowserSummary.js");
const { readShliachPageStatus } = require("./shliachPageStatus.js");

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
	const port = opened.port || opened.debugPort;
	const shliach = browser.ready
		? await readShliachPageStatus(port)
		: { known: false, shliachOpen: false, conversationOpen: false };
	const session = browser.ready
		? await safeSession(payload, port)
		: { authenticated: false, known: false };
	return {
		ok: true,
		action: "chatgptStatus",
		browser,
		shliach,
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
