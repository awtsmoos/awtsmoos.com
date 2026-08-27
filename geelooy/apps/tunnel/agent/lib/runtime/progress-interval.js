// B"H
// Boruch Hashem
// Blessed is He

const MAX_PROGRESS_GAP_MS = 5000;

/**
 * Keeps request progress strictly fresher than the relay consumer watchdog.
 * Transport pings may be slower; accepted work needs its own living receipt.
 */
function milliseconds(limits = {}) {
	const configured = Number(limits.KEEPALIVE_MS) || MAX_PROGRESS_GAP_MS;
	return Math.max(250, Math.min(configured, MAX_PROGRESS_GAP_MS));
}

module.exports = {
	MAX_PROGRESS_GAP_MS,
	milliseconds
};
