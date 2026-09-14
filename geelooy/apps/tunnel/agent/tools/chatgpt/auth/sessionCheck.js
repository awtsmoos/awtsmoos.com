//B"H
//Boruch Hashem
//Blessed be He

const { directAuth } = require("../direct/auth.js");
const PortAuthority = require("../chrome/portAuthority.js");

/**
 * @file Reports ChatGPT authentication through the selected Shared AI Browser.
 * @description
 * Raw credentials remain inside Chrome. Node receives only the canonical browser
 * endpoint and returns a redacted authentication summary to higher layers.
 */
async function sessionCheck(payload = {}) {
	const port = PortAuthority.requireCurrent(payload);
	const auth = await directAuth({ ...payload, port });
	return {
		ok: true,
		action: "chatgptSessionCheck",
		port,
		session: auth.session
	};
}

/**
 * Polls authentication without opening tabs or sending prompts.
 * @param {object} payload Browser/auth polling options.
 * @returns {Promise<object>} Authenticated state or a bounded timeout summary.
 */
async function waitForSession(payload = {}) {
	const timeoutMs = Number(payload.timeoutMs || 180000);
	const pollMs = Number(payload.pollMs || 1500);
	const start = Date.now();
	let last = null;
	while (Date.now() - start < timeoutMs) {
		last = await sessionCheck(payload);
		if (last.session?.authenticated) {
			return { ...last, waitedMs: Date.now() - start };
		}
		await new Promise(resolve => setTimeout(resolve, pollMs));
	}
	return {
		ok: false,
		action: "chatgptWaitForSession",
		error: "login_timeout",
		waitedMs: Date.now() - start,
		lastSession: last?.session || null
	};
}

module.exports = {
	sessionCheck,
	waitForSession
};
