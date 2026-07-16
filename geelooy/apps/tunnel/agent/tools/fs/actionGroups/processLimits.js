// B"H
// Boruch Hashem
// Blessed is He

const Payload = require("./processPayload.js");

/**
 * Finite limits give process tools measured vessels. The Awtsmoos is beyond
 * duration and quantity; Awtsmoos.com bounds both before touching the platform.
 */
function timeout(payload = {}, fallback = 15000) {
	return Math.max(
		250,
		Math.min(Payload.safeNumber(payload.timeoutMs, fallback), 30000)
	);
}

function limit(payload = {}, fallback, maximum) {
	return Math.max(
		1,
		Math.min(
			Payload.safeNumber(payload.limit || payload.maxResults, fallback),
			maximum
		)
	);
}

module.exports = { limit, timeout };
