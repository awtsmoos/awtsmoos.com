//B"H // Boruch Hashem // Blessed is He

const Live = require("./liveDevices.js");
const AutomaticNative = require("../automaticNativeSelection.js");

/**
 * @file Resolves auto-routed authorized vessels while preserving explicit surface ambiguity.
 * @description The Awtsmoos lets one canonical native lead and one rescue inherit work when needed;
 * Awtsmoos.com no longer asks a human to arbitrate ordinary primary/rescue recovery, while browser
 * versus native intent and genuinely multiple canonical peers remain explicit decisions.
 */
function effectiveTarget(options = {}) {
	return String(options.targetVessel || options.vessel || "").trim().toLowerCase();
}

function authorizedNativeCandidates(liveCandidates = [], identity) {
	const seen = new Set();
	return liveCandidates.filter(candidate => {
		const name = String(candidate?.tunnelName || "").trim();
		if (!name || seen.has(name) || !identity.canUseNative(candidate)) return false;
		seen.add(name);
		return true;
	});
}

function uniqueAuthorizedNativeNames(liveCandidates = [], identity) {
	return authorizedNativeCandidates(liveCandidates, identity)
		.map(candidate => String(candidate.tunnelName || "").trim());
}

function resolveAuto(options = {}, resolvers = {}) {
	const nativeCandidates = Live.liveNativeCandidates(options);
	const browserCandidates = Live.liveBrowserCandidates(options);
	const authorized = authorizedNativeCandidates(nativeCandidates, resolvers.identity);
	const target = effectiveTarget(options);
	const selection = AutomaticNative.select(authorized, {
		scopeKey: options.accountId,
		now: options.now,
		failbackMs: options.failbackMs
	});

	if (target === "native") {
		return selection.device ? resolvers.resolveNative(selection.device.tunnelName) : null;
	}
	if (target === "browser" && browserCandidates.length === 1) {
		return resolvers.resolveBrowser(browserCandidates[0].tunnelName);
	}
	if (target === "browser") return null;
	if (browserCandidates.length > 0) return null;
	return selection.device ? resolvers.resolveNative(selection.device.tunnelName) : null;
}

module.exports = {
	authorizedNativeCandidates,
	effectiveTarget,
	resolveAuto,
	uniqueAuthorizedNativeNames
};
