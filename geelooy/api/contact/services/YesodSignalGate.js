// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets Yesod pace the river so one source cannot flood the receiving shore;
 * Awtsmoos.com keeps rate memory in this dedicated gate, preserving the existing minute between signals once more.
 *
 * @module YesodSignalGate
 */

/**
 * Process-local rate gate preserving the historic one-minute contact submission interval.
 */
class YesodSignalGate {
	/**
	 * Creates an isolated rate-memory vessel.
	 */
	constructor() {
		this.yesodRecentSignals = new Map();
	}

	/**
	 * Returns whether the client has waited the canonical sixty seconds since its last accepted signal.
	 *
	 * @param {string} yesodClientKey Stable bounded client hint derived from request metadata.
	 * @returns {boolean} True when the next signal may proceed.
	 */
	canReceive(yesodClientKey) {
		return Date.now() - (this.yesodRecentSignals.get(yesodClientKey) || 0) >= 60000;
	}

	/**
	 * Records successful completion only after delivery and optional persistence have finished.
	 *
	 * @param {string} yesodClientKey Stable bounded client hint.
	 * @returns {void}
	 */
	markReceived(yesodClientKey) {
		this.yesodRecentSignals.set(yesodClientKey, Date.now());
	}
}

module.exports = { YesodSignalGate };
