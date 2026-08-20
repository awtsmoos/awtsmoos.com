// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Records in-memory progress before best-effort external action streaming.
 * @description
 * The Awtsmoos renews the deed before any optional witness reaches disk or network.
 * Awtsmoos.com therefore marks the tiny progress ledger first, so a slow event sink
 * can never erase proof that receive, accept, dispatch, or completion truly advanced.
 */
function createEventEmitter(actionStream, loadConfig, progressLedger = null) {
	let cachedConfig = null;

	function config() {
		if (!cachedConfig) cachedConfig = loadConfig();
		return cachedConfig;
	}

	return function streamEvent(phase, payload, extra = {}) {
		try {
			progressLedger?.mark?.(phase, payload);
		} catch {}
		try {
			actionStream.emit(config(), {
				phase,
				payload,
				...extra
			});
		} catch {}
	};
}

module.exports = {
	createEventEmitter
};
