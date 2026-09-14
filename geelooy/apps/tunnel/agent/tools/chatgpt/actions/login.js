//B"H
//Boruch Hashem
//Blessed be He

const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck, waitForSession } = require("../auth/sessionCheck.js");
const { saveProfileState } = require("../storage/profileState.js");
const BrowserSummary = require("./sharedBrowserSummary.js");
const Shliach = require("./shliachTarget.js");
const { readShliachPageStatus } = require("./shliachPageStatus.js");

/**
 * @file Opens the Awtsmoos Shliach inside the one visible Shared AI Browser.
 * @description
 * The Awtsmoos lets the human authenticate once inside the exact browser every agent reuses.
 * Generic ChatGPT home pages are not considered the website-agent doorway or readiness proof.
 */
async function chatgptLogin(payload = {}) {
	const target = Shliach.publicTarget();
	const launched = await ensureProfileChrome({
		...payload,
		url: target.url,
		navigate: true,
		newTab: false
	});
	const checkPayload = { ...payload, port: launched.port };
	const check = wantsWait(payload)
		? await waitForSession(checkPayload)
		: await sessionCheck(checkPayload);
	const session = check.session || check.lastSession || null;
	const shliach = await readShliachPageStatus(launched.port);
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
		loginUrl: target.url,
		target,
		shliach,
		browser: BrowserSummary.summarize({
			ok: true,
			status: launched.browserStatus,
			reused: launched.reused
		}),
		session,
		needsManualLogin: !session?.authenticated
	};
}

/** Returns whether the caller explicitly requested bounded login waiting. */
function wantsWait(payload = {}) {
	return payload.wait === true || payload.wait === "true";
}

module.exports = { chatgptLogin };
