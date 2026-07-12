// B"H
const REPLACEMENT_TYPE = 'TUNNEL_REPLACED';
const DEFAULT_EXIT_DELAY_MS = 25;

/**
 * B"H — One tunnel name may have one living owner. The older vessel closes its
 * road, refuses reconnect, and exits cleanly after the newer registration wins.
 */
function isReplacementMessage(data = {}) {
	return String(data.type || '') === REPLACEMENT_TYPE;
}

function exitBecauseNewerConnectionOwnsTunnel(options = {}) {
	const delayMs = boundedDelay(options.delayMs);
	const receipt = {
		ok: true,
		action: 'exitBecauseNewerConnectionOwnsTunnel',
		reason: options.reason || 'newer_agent_connection_adopted',
		delayMs,
		requestedAt: new Date().toISOString()
	};
	options.clearReconnect?.();
	options.close?.();
	options.log?.('info', 'Newer tunnel connection adopted; older agent will exit cleanly.');
	const setTimer = options.setTimer || setTimeout;
	const exit = options.exit || process.exit;
	const timer = setTimer(() => exit(0), delayMs);
	timer?.unref?.();
	return receipt;
}

function boundedDelay(value) {
	const number = Number(value ?? DEFAULT_EXIT_DELAY_MS);
	if (!Number.isFinite(number)) return DEFAULT_EXIT_DELAY_MS;
	return Math.max(0, Math.min(5000, Math.floor(number)));
}

module.exports = {
	DEFAULT_EXIT_DELAY_MS,
	REPLACEMENT_TYPE,
	boundedDelay,
	exitBecauseNewerConnectionOwnsTunnel,
	isReplacementMessage
};
