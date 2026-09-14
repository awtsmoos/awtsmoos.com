//B"H
//Boruch Hashem
//Blessed be He

const { requireSplitBrowser } = require("../../../lib/split-browser-require.js");

const Registry = requireSplitBrowser("deviceBrowserRegistry.cjs");
const SharedProfile = requireSplitBrowser("sharedChromeProfile.cjs");
const Chrome = requireSplitBrowser("cdpChrome.cjs");

/**
 * @file Bridges every packaged ChatGPT action into one device-owned AI browser.
 * @description
 * The physical profile is durable identity; host, port, PID, and browser
 * incarnation are replaceable transport discovered from the live device.
 * Callers never need to guess a debug port or invent a second profile.
 */

/** Returns the canonical physical profile path for internal native use. */
function profilePath() {
	return Registry.selectedProfile();
}

/** Returns the current device browser authority without launching Chrome. */
function authority() {
	return Registry.observe();
}
/** Returns safe browser identity for UI and action responses. */
function identity() {
	return SharedProfile.publicIdentity();
}

/** Returns canonical shared-browser config from the live device authority. */
function config(options = {}) {
	const current = authority();
	const debugPort = current.ok
		? current.port
		: SharedProfile.requestedPort(options);
	return {
		...options,
		debugPort
	};
}
/** Returns the live authority port, or a compatible fallback while offline. */
function port(options = {}) {
	return config(options).debugPort;
}

/** Opens or reuses the selected browser and waits for CDP readiness. */
async function open(options = {}) {
	return Chrome.openDebugChrome(config(options));
}

/** Reads browser readiness without launching a new process. */
async function status(options = {}) {
	return Chrome.statusDebugChrome(config(options));
}

module.exports = {
	authority,
	config,
	identity,
	open,
	port,
	profilePath,
	status
};
