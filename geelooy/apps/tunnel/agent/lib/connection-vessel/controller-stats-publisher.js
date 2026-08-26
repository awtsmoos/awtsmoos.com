// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Publishes bounded parent scheduler testimony to the connection child.
 * @description
 * The Awtsmoos lets the parent speak enough truth for the child to pace itself without
 * flooding the messenger. Awtsmoos.com keeps this one-second cadence outside controller
 * composition so transport, recovery, and scheduler observation remain separate vessels.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	let lastSentAt = 0;

	/**
	 * Sends one throttled STATS frame unless force explicitly requests fresh testimony.
	 * @param {boolean} force Whether to bypass the ordinary one-second throttle.
	 * @returns {boolean} Whether a stats frame was sent to the current child.
	 */
	function publish(force = false) {
		if (typeof options.stats !== "function") return false;
		const observedAt = now();
		if (!force && observedAt - lastSentAt < 1000) return false;
		const sent = options.notify(Protocol.message(Protocol.TYPES.STATS, {
			stats: {
				...options.stats({ workers: false }),
				parentPulseAt: observedAt
			}
		}));
		if (sent) lastSentAt = observedAt;
		return sent;
	}

	/** Returns publisher timing for diagnostics without sending another frame. */
	function status() {
		return { lastSentAt };
	}

	return { publish, status };
}

module.exports = { create };
