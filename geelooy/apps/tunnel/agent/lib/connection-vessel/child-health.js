// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes transport, execution, and mailbox testimony without collapsing repair policy.
 * @description
 * The Awtsmoos gives socket, worker, and durable mailbox each a truthful voice;
 * Awtsmoos.com calls the vessel healthy only when all three agree, while restart remains a separate choice.
 */
function compose(state = {}, parent = {}, mailbox = {}) {
	const transportHealthy = state.activeWs?.opened === true &&
		state.registrationConfirmed === true;
	const execution = executionHealth(parent);
	const mailboxView = mailboxHealth(mailbox);
	const healthy = transportHealthy && execution.healthy && mailboxView.healthy;
	return {
		healthy,
		state: overallState(transportHealthy, execution, mailboxView),
		transportHealthy,
		executionHealthy: execution.healthy,
		mailboxHealthy: mailboxView.healthy,
		mailboxState: mailboxView.state,
		execution,
		mailbox: mailboxView
	};
}

/** Converts watchdog testimony into a stable public execution-health shape. */
function executionHealth(parent = {}) {
	const execution = parent.execution || {};
	const healthy = parent.healthy !== false && execution.healthy !== false;
	return {
		...execution,
		healthy,
		state: healthy
			? "healthy"
			: parent.repairReason || execution.state || "execution_unhealthy",
		parentAgeMs: nonnegative(parent.parentAgeMs),
		parentUnresponsive: parent.parentUnresponsive === true,
		repairing: parent.repairing === true
	};
}

/** Projects only bounded mailbox facts, never receipt identity or command content. */
function mailboxHealth(mailbox = {}) {
	const health = mailbox.health || {};
	const inbox = mailbox.inbox || {};
	const outbox = mailbox.outbox || {};
	const known = typeof health.healthy === "boolean";
	return {
		healthy: known ? health.healthy === true : true,
		state: known ? text(health.state || "unknown") : "healthy",
		inboxCount: nonnegative(inbox.count),
		inboxOldestAgeMs: nonnegative(inbox.oldestAgeMs),
		outboxCount: nonnegative(outbox.count),
		outboxOldestAgeMs: nonnegative(outbox.oldestAgeMs)
	};
}

function overallState(transportHealthy, execution, mailbox) {
	if (!transportHealthy) return "transport_unhealthy";
	if (!execution.healthy) return execution.state || "execution_unhealthy";
	if (!mailbox.healthy) return `mailbox_${mailbox.state || "unhealthy"}`;
	return "healthy";
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function text(value) {
	return String(value || "unknown").slice(0, 120);
}

module.exports = {
	compose,
	executionHealth,
	mailboxHealth,
	overallState
};
