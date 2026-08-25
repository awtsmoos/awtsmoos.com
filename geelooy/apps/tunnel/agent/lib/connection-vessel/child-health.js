// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes transport, execution, mailbox, and consumer-recovery testimony.
 * @description
 * The Awtsmoos reveals each witness without letting one borrow another's certainty.
 * Awtsmoos.com shows when a consumer is merely pressured, when recovery is gathering
 * evidence, and when durable custody still needs protection before any generation turns.
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

/** Projects execution testimony plus the bounded consumer-recovery state. */
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
		repairing: parent.repairing === true,
		consumerRecovery: consumerRecovery(parent.consumerRecovery)
	};
}

/** Projects only non-identifying recovery evidence safe for health publication. */
function consumerRecovery(value = {}) {
	return {
		repairAuthorized: value.repairAuthorized === true,
		reason: text(value.reason || "consumer_healthy"),
		candidateAgeMs: nonnegative(value.candidateAgeMs),
		candidateSince: nonnegative(value.candidateSince),
		observations: nonnegative(value.observations),
		sustainMs: nonnegative(value.sustainMs),
		minimumObservations: nonnegative(value.minimumObservations),
		recentRepairs: nonnegative(value.ledger?.history?.length)
	};
}

/** Projects bounded mailbox health and custody age without request identities. */
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
		inboxParentCustodyCount: nonnegative(inbox.parentCustodyCount),
		inboxOldestAgeMs: nonnegative(inbox.oldestAgeMs),
		outboxCount: nonnegative(outbox.count),
		outboxOldestAgeMs: nonnegative(outbox.oldestAgeMs)
	};
}

/** Grants degraded inbox custody only when current execution demonstrably owns all of it. */
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
	const activeOwned = nonnegative(stages.active) >= inboxCount &&
		nonnegative(stages.consumerStarted) >= inboxCount;
	const parentOwned = nonnegative(mailbox.inboxParentCustodyCount) >= inboxCount;
	return mailbox.rawState === "degraded" &&
		mailbox.inboxState === "degraded" &&
		mailbox.outboxState === "healthy" &&
		inboxCount > 0 &&
		execution.healthy === true &&
		execution.consumerStalled !== true &&
		execution.backpressured !== true &&
		execution.repairing !== true &&
		(activeOwned || parentOwned);
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
	consumerRecovery,
	executionHealth,
	mailboxHealth,
	overallState
};
