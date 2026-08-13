// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes transport, execution, and mailbox testimony without false alarms.
 * @description The Awtsmoos lets durable age remain strict while Awtsmoos.com also
 * remembers that accepted deeds may still be faithfully executing. A merely degraded
 * inbox may borrow green routing health only while every receipt is consumer-started;
 * stalled, full, orphaned, or outbound testimony never receives that grace.
 */
function compose(state = {}, parent = {}, mailbox = {}) {
	const transportHealthy = state.activeWs?.opened === true &&
		state.registrationConfirmed === true;
	const execution = executionHealth(parent);
	const rawMailbox = mailboxHealth(mailbox);
	const mailboxView = applyActiveExecutionGrace(rawMailbox, execution);
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

/** Projects bounded mailbox facts while preserving raw lane state. */
function mailboxHealth(mailbox = {}) {
	const health = mailbox.health || {};
	const inbox = mailbox.inbox || {};
	const outbox = mailbox.outbox || {};
	const known = typeof health.healthy === "boolean";
	const state = known ? text(health.state || "unknown") : "healthy";
	return {
		healthy: known ? health.healthy === true : true,
		state,
		rawState: state,
		inboxState: text(inbox.state || "healthy"),
		outboxState: text(outbox.state || "healthy"),
		activeExecutionGrace: false,
		inboxCount: nonnegative(inbox.count),
		inboxOldestAgeMs: nonnegative(inbox.oldestAgeMs),
		outboxCount: nonnegative(outbox.count),
		outboxOldestAgeMs: nonnegative(outbox.oldestAgeMs)
	};
}

/** Allows only fully consumer-owned degraded inbox custody to remain routable. */
function applyActiveExecutionGrace(mailbox = {}, execution = {}) {
	if (!canGrace(mailbox, execution)) return mailbox;
	return {
		...mailbox,
		healthy: true,
		state: "healthy",
		activeExecutionGrace: true
	};
}

function canGrace(mailbox, execution) {
	const stages = execution.stages || {};
	const inboxCount = nonnegative(mailbox.inboxCount);
	return mailbox.rawState === "degraded" &&
		mailbox.inboxState === "degraded" &&
		mailbox.outboxState === "healthy" &&
		inboxCount > 0 &&
		execution.healthy === true &&
		execution.consumerStalled !== true &&
		execution.backpressured !== true &&
		execution.repairing !== true &&
		nonnegative(stages.active) >= inboxCount &&
		nonnegative(stages.consumerStarted) >= inboxCount;
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
	applyActiveExecutionGrace,
	compose,
	executionHealth,
	mailboxHealth,
	overallState
};
