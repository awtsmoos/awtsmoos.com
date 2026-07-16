// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INTERVAL_MS = 15000;
const DEFAULT_PING_IDLE_MS = 20000;
const DEFAULT_DEAD_IDLE_MS = 75000;

/**
 * @file Detects half-open WebSocket transports and forces bounded recovery.
 * @description
 * The Awtsmoos renews every inbound byte as living testimony. Awtsmoos.com sends
 * a quiet ping after silence, expires a connection that remains unheard, and treats
 * laptop sleep or vanished relay paths as reasons to reconnect rather than wait forever.
 */
function createTransportLiveness(options = {}) {
	const now = options.now || Date.now;
	const setTimer = options.setTimer || setInterval;
	const clearTimer = options.clearTimer || clearInterval;
	const intervalMs = bounded(
		options.intervalMs ?? process.env.AWTSMOOS_WS_LIVENESS_INTERVAL_MS,
		1000,
		60000,
		DEFAULT_INTERVAL_MS
	);
	const pingIdleMs = bounded(
		options.pingIdleMs ?? process.env.AWTSMOOS_WS_PING_IDLE_MS,
		intervalMs,
		300000,
		DEFAULT_PING_IDLE_MS
	);
	const deadIdleMs = bounded(
		options.deadIdleMs ?? process.env.AWTSMOOS_WS_DEAD_IDLE_MS,
		pingIdleMs + intervalMs,
		900000,
		DEFAULT_DEAD_IDLE_MS
	);
	let lastInboundAt = Number(now());
	let lastPingAt = 0;
	let timer = null;

	function observeInbound(at = now()) {
		lastInboundAt = Number(at);
		lastPingAt = 0;
	}

	function tick(at = now()) {
		const current = Number(at);
		const idleMs = Math.max(0, current - lastInboundAt);
		if (idleMs >= deadIdleMs) {
			options.onDead?.({ idleMs, lastInboundAt, at: current });
			return { state: "dead", idleMs };
		}
		if (idleMs >= pingIdleMs && current - lastPingAt >= intervalMs) {
			lastPingAt = current;
			options.onPing?.({ idleMs, lastInboundAt, at: current });
			return { state: "pinged", idleMs };
		}
		return { state: "healthy", idleMs };
	}

	function start() {
		if (timer) return snapshot();
		timer = setTimer(tick, intervalMs);
		timer?.unref?.();
		return snapshot();
	}

	function stop() {
		if (timer) clearTimer(timer);
		timer = null;
	}

	function snapshot() {
		return {
			intervalMs,
			pingIdleMs,
			deadIdleMs,
			lastInboundAt,
			lastPingAt,
			running: Boolean(timer)
		};
	}

	return {
		observeInbound,
		snapshot,
		start,
		stop,
		tick
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

module.exports = {
	DEFAULT_DEAD_IDLE_MS,
	DEFAULT_INTERVAL_MS,
	DEFAULT_PING_IDLE_MS,
	bounded,
	createTransportLiveness
};
