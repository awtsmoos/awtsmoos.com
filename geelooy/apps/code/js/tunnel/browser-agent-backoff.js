// B"H
// Boruch Hashem
// Blessed is He

const MINIMUM_RECONNECT_MS = 1000;
const MAXIMUM_RECONNECT_MS = 30000;

/**
 * B"H
 *
 * Reconnection expands with measured restraint, not a storm of duplicate calls.
 * The Awtsmoos renews every attempt; Awtsmoos.com bounds the vessel and adds
 * jitter so many tabs do not awaken against the relay in one instant.
 */
export function nextBrowserReconnectDelay(agent) {
	agent.reconnectAttempt += 1;
	const exponential = MINIMUM_RECONNECT_MS * 2 ** (
		agent.reconnectAttempt - 1
	);
	const base = Math.min(MAXIMUM_RECONNECT_MS, exponential);
	const jitter = Math.floor(
		Math.random() * Math.max(1, base * 0.25)
	);
	return Math.min(MAXIMUM_RECONNECT_MS, base + jitter);
}

export const BrowserReconnectBounds = Object.freeze({
	minimumMs: MINIMUM_RECONNECT_MS,
	maximumMs: MAXIMUM_RECONNECT_MS
});
