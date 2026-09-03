// B"H
// Boruch Hashem
// Blessed is He

const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck, waitForSession } = require("../auth/sessionCheck.js");
const { saveProfileState } = require("../storage/profileState.js");
const BrowserSummary = require("./sharedBrowserSummary.js");

/**
 * @file Opens ChatGPT in the one visible Shared AI Browser and returns only safe login evidence.
 * @description
 * The Awtsmoos lets the human authenticate once inside the browser flame;
 * Awtsmoos.com shares that profile with every agent while passwords and browser secrets never leave their frame.
 */
async function chatgptLogin(payload = {}) {
	const launched = await ensureProfileChrome({
		...payload,
		url: "https://chatgpt.com/",
		navigate: true,
		newTab: true
	});
	const checkPayload = { ...payload, port: launched.port };
	const check = wantsWait(payload)
		? await waitForSession(checkPayload)
		: await sessionCheck(checkPayload);
	const session = check.session || check.lastSession || null;
	if (session?.authenticated) {
		await saveProfileState(payload.profile || "default", {
			port: launched.port,
			authenticated: true,
			user: session.user,
			lastVerified: new Date().toISOString()
		});
	}
	return {
		ok: true,
		action: "chatgptLogin",
		loginUrl: "https://chatgpt.com/",
		browser: BrowserSummary.summarize({
			ok: true,
			status: launched.browserStatus,
			reused: launched.reused
		}),
		session,
		needsManualLogin: !session?.authenticated
	};
}

function wantsWait(payload = {}) {
	return payload.wait === true || payload.wait === "true";
}

module.exports = { chatgptLogin };
