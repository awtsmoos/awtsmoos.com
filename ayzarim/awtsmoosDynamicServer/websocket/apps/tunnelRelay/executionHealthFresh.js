// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_HEALTH_STALE_MS = 20000;

/** Pure execution-health freshness predicate kept outside health/recovery modules to avoid circular initialization. */
function isFresh(client = {}, now = Date.now(), staleMs = DEFAULT_HEALTH_STALE_MS) {
	if (client.executionHealthSupported !== true) return true;
	const observedAt = Number(client.executionHealthAt || 0);
	return observedAt > 0 && now - observedAt >= 0 && now - observedAt <= staleMs;
}

module.exports = {
	DEFAULT_HEALTH_STALE_MS,
	isFresh
};
