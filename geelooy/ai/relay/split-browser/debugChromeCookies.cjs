//B"H
// Boruch Hashem
// Blessed is He

const { findPageTarget } = require("./debugChromeDiscovery.cjs");
const { discoveryOptions } = require("./debugChromeLauncher.cjs");

/**
 * Compatibility boundary for old callers. Authentication remains inside Chrome's
 * private 0700 profile; no cookie name, value, token, or credential crosses into Node.
 */
async function readDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) throw new Error(target.error);
	return { cookies: [], profileOwned: true };
}

function storeDebugCookies() {
	return { stored: false, reason: "browser_profile_owns_session" };
}

function summarizeDebugCookies(target, _cookies, cookieError = "") {
	return {
		ok: !cookieError,
		status: cookieError ? "debug_chrome_profile_check_failed" : "browser_profile_owns_session",
		debugPort: target.debugPort,
		targetKind: target.kind,
		cookieCount: null,
		cookieNames: [],
		credentialValuesRead: false,
		cookieError
	};
}

module.exports = {
	readDebugCookies,
	storeDebugCookies,
	summarizeDebugCookies
};
