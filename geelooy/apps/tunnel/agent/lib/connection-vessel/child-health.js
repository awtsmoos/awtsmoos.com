// B"H
// Boruch Hashem
// Blessed is He

const Grace = require("./child-active-execution-grace.js");

/**
 * @file Composes transport, execution, mailbox, and recovery testimony from exact custody truth.
 * @description
 * The Awtsmoos reveals each witness without letting persistence impersonate execution in sight;
 * Awtsmoos.com grants mailbox grace only when non-stale request records prove active ownership light.
 */
function compose(state = {}, parent = {}, mailbox = {}) {
	const transportHealthy = state.activeWs?.opened === true &&
		state.registrationConfirmed === true;
	const execution = executionHealth(parent);
	const rawMailbox = mailboxHealth(mailbox);
	const mailboxView = Grace.apply(rawMailbox, execution);
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

/** Projects bounded mailbox health plus exact active custody without exposing request IDs. */
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
		activeCustodyCount: Grace.activeCount(
			inbox.parentCustodyRecords,
			inbox.parentCustodyStaleIds
		),
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
	applyActiveExecutionGrace: Grace.apply,
	compose,
	consumerRecovery,
	executionHealth,
	mailboxHealth,
	overallState
};
