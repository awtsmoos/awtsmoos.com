//B"H
//Boruch Hashem
//Blessed be He

const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck } = require("../auth/sessionCheck.js");
const BrowserSummary = require("./sharedBrowserSummary.js");
const Shliach = require("./shliachTarget.js");
const { readShliachPageStatus } = require("./shliachPageStatus.js");

/**
 * @file Self-heals the one Shared AI Browser and restores the Awtsmoos Shliach doorway.
 * @description
 * The Awtsmoos may lose a tab while the Chrome process survives. This action repairs only
 * the selected AI profile, navigates one visible Shliach surface, and reports safe auth truth.
 */
async function chatgptEnsureChrome(payload = {}) {
	const target = Shliach.publicTarget();
	const launched = await ensureProfileChrome({
		...payload,
		url: target.url,
		navigate: true,
		newTab: false
	});
	const shliach = await readShliachPageStatus(launched.port);
	const session = await safeSession(payload, launched.port);
	return {
		ok: true,
		action: "chatgptEnsureChrome",
		target,
		shliach,
		browser: BrowserSummary.summarize({
			ok: true,
			status: launched.browserStatus,
			reused: launched.reused
		}),
		session,
		needsManualLogin: session.authenticated !== true
	};
}

/** Reads authentication without allowing a failed probe to erase browser readiness. */
async function safeSession(payload, port) {
	try {
		const result = await sessionCheck({ ...payload, port });
		return { ...result.session, known: true };
	} catch (error) {
		return {
			authenticated: false,
		known: false,
			error: String(error?.message || error || "session_unavailable").slice(0, 160)
		};
	}
}

module.exports = { chatgptEnsureChrome };
