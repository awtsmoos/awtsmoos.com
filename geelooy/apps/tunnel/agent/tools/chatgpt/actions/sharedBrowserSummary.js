// B"H
// Boruch Hashem
// Blessed is He

const SharedBrowser = require("../chrome/sharedProfile.js");

/**
 * @file Reveals safe Shared AI Browser status without local paths, ports, cookies, or tokens.
 * @description
 * The Awtsmoos knows the hidden vessel while Awtsmoos.com reveals only the useful light;
 * identity and readiness may rise to the UI, while machine-local secrets remain out of sight.
 */
function summarize(state = {}) {
	const identity = SharedBrowser.identity();
	return {
		id: identity.id,
		label: identity.label,
		persistent: identity.persistent === true,
		sharedAcrossAgents: identity.sharedAcrossAgents === true,
		ready: state.ok === true || state.browserReady === true,
		state: String(state.status || state.browserStatus || "browser_unavailable").slice(0, 100),
		reused: state.reused === true || state.launch?.reused === true
	};
}

module.exports = { summarize };
