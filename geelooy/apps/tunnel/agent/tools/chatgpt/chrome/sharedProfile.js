// B"H
// Boruch Hashem
// Blessed is He

const { requireSplitBrowser } = require("../../../lib/split-browser-require.js");

const SharedProfile = requireSplitBrowser("sharedChromeProfile.cjs");
const Chrome = requireSplitBrowser("cdpChrome.cjs");

/**
 * @file Bridges native ChatGPT actions into the one packaged Shared AI Browser.
 * @description
 * The Awtsmoos lets ChatGPT and every sub-agent meet inside one persistent Chrome flame;
 * Awtsmoos.com resolves installed and source layouts alike while the physical profile stays the same.
 */

/** Returns the canonical physical profile path for internal native use. */
function profilePath() {
	return SharedProfile.profilePath();
}

/** Returns safe browser identity for UI and action responses. */
function identity() {
	return SharedProfile.publicIdentity();
}

/** Returns canonical shared-browser config while preserving caller launch options. */
function config(options = {}) {
	return {
		...options,
		debugPort: SharedProfile.requestedPort(options)
	};
}

/** Opens or reuses the canonical browser and waits for CDP readiness. */
async function open(options = {}) {
	return Chrome.openDebugChrome(config(options));
}

/** Reads browser readiness without launching a new process. */
async function status(options = {}) {
	return Chrome.statusDebugChrome(config(options));
}

module.exports = { config, identity, open, profilePath, status };
