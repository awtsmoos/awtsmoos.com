// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_HEALTH_INTERVAL_MS = 5000;

/**
 * @file Publishes bounded transport, execution, mailbox, and admission health without leaking receipts.
 * @description
 * The Awtsmoos renews every vessel while truth remains compact and bright;
 * Awtsmoos.com reveals admission silence by count and age, never by a private request identity in sight.
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

/** Removes receipt identity and keeps only bounded health facts safe for relay state. */
function publicHealth(snapshot = {}) {
	const full = snapshot.fullHealth || {};
	const execution = snapshot.executionHealth || {};
	const mailbox = full.mailbox || {};
	return {
		healthy: full.healthy === true,
		state: text(full.state),
		transportHealthy: full.transportHealthy === true,
		executionHealthy: full.executionHealthy === true,
		mailboxHealthy: full.mailboxHealthy !== false,
		mailboxState: text(full.mailboxState || "healthy"),
		execution: {
			healthy: execution.healthy === true,
			state: text(execution.state),
			consumerStalled: execution.consumerStalled === true,
			ingressStalled: execution.ingressStalled === true,
			parentUnresponsive: execution.parentUnresponsive === true,
			repairing: execution.repairing === true,
			parentAgeMs: nonnegative(execution.parentAgeMs),
			acceptedAgeMs: nonnegative(execution.acceptedAgeMs),
			unresolved: nonnegative(execution.unresolved),
			unownedIngress: nonnegative(execution.unownedIngress),
			unownedIngressAgeMs: nonnegative(execution.unownedIngressAgeMs)
		},
		mailbox: {
			inboxCount: nonnegative(mailbox.inboxCount),
			inboxOldestAgeMs: nonnegative(mailbox.inboxOldestAgeMs),
			outboxCount: nonnegative(mailbox.outboxCount),
			outboxOldestAgeMs: nonnegative(mailbox.outboxOldestAgeMs)
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
