//B"H
//Boruch Hashem
//Blessed be He

const SharedBrowser = require("./sharedProfile.js");

/**
 * @file Resolves browser transport for legacy ChatGPT helpers without magic ports.
 * @description
 * Live device authority always wins. Explicit caller ports survive only when
 * no selected browser is currently observable, which keeps isolated tests and
 * recovery probes possible without letting production drift across profiles.
 */
function current(input = {}) {
	const authority = SharedBrowser.authority();
	if (authority.ok) return authority.port;
	for (const candidate of [input.port, input.chromePort, input.debugPort]) {
		const port = Number(candidate);
		if (Number.isInteger(port) && port > 0 && port <= 65535) return port;
	}
	return 0;
}

/** Returns a canonical payload carrying the one selected browser endpoint. */
function bind(input = {}) {
	const port = current(input);
	return port ? {
		...input,
		port,
		chromePort: port,
		debugPort: port
	} : { ...input };
}
/** Requires a real browser endpoint instead of falling through to a guessed port. */
function requireCurrent(input = {}) {
	const port = current(input);
	if (port) return port;
	const error = new Error("shared_ai_browser_unavailable");
	error.code = "shared_ai_browser_unavailable";
	throw error;
}

module.exports = {
	bind,
	current,
	requireCurrent
};
/**
 * Binds public browser actions fail-closed when no canonical endpoint is known.
 * The negative sentinel is intentionally truthy so legacy `value || 9223`
 * expressions cannot silently jump to an unrelated local Chrome instance.
 */
function bindRequired(input = {}) {
	const port = current(input) || -1;
	return {
		...input,
		port,
		chromePort: port,
		debugPort: port
	};
}

module.exports.bindRequired = bindRequired;
