// B"H

/**
 * Emits best-effort action evidence from one cached runtime configuration.
 * Reloading configuration for every phase previously placed synchronous disk
 * reads directly inside burst ingress and delayed control frames.
 */
function createEventEmitter(actionStream, loadConfig) {
	let cachedConfig = null;
	function config() {
		if (!cachedConfig) cachedConfig = loadConfig();
		return cachedConfig;
	}
	return function streamEvent(phase, payload, extra = {}) {
		try {
			actionStream.emit(config(), { phase, payload, ...extra });
		} catch {}
	};
}

module.exports = {
	createEventEmitter
};
