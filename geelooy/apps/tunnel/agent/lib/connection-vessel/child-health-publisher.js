// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_HEALTH_INTERVAL_MS = 5000;

/**
 * @file Publishes bounded execution health without flooding the relay.
 * @description
 * The Awtsmoos renews transport and execution as distinct witnesses. Awtsmoos.com
 * sends a compact health testimony when its meaning changes or a bounded interval
 * passes, so the server can reject false-green work without learning private state.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const intervalMs = bounded(options.intervalMs, DEFAULT_HEALTH_INTERVAL_MS);
	let lastSentAt = 0;
	let lastSignature = "";

	function publish(snapshot = {}, transmit = () => false) {
		if (snapshot.registered !== true || snapshot.connected !== true) return false;
		const observedAt = now();
		const health = publicHealth(snapshot);
		const signature = JSON.stringify(health);
		const changed = signature !== lastSignature;
		const due = observedAt - lastSentAt >= intervalMs;
		if (!changed && !due) return false;
		const sent = transmit({
			type: "TUNNEL_HEALTH",
			at: new Date(observedAt).toISOString(),
			health
		});
		if (!sent) return false;
		lastSentAt = observedAt;
		lastSignature = signature;
		return true;
	}

	return { publish };
}

/**
 * Removes queue identities and keeps only bounded health facts safe for relay state.
 * @param {object} snapshot Connection-child snapshot.
 * @returns {object} Compact health contract.
 */
function publicHealth(snapshot = {}) {
	const full = snapshot.fullHealth || {};
	const execution = snapshot.executionHealth || {};
	return {
		healthy: full.healthy === true,
		state: text(full.state),
		transportHealthy: full.transportHealthy === true,
		executionHealthy: full.executionHealthy === true,
		execution: {
			healthy: execution.healthy === true,
			state: text(execution.state),
			consumerStalled: execution.consumerStalled === true,
			parentUnresponsive: execution.parentUnresponsive === true,
			repairing: execution.repairing === true,
			parentAgeMs: nonnegative(execution.parentAgeMs),
			acceptedAgeMs: nonnegative(execution.acceptedAgeMs),
			unresolved: nonnegative(execution.unresolved)
		}
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(60000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function text(value) {
	return String(value || "unknown").slice(0, 120);
}

module.exports = {
	DEFAULT_HEALTH_INTERVAL_MS,
	create,
	publicHealth
};
