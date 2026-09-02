// B"H
// Boruch Hashem
// Blessed is He

const ACTIVE_PHASES = new Set(["worker_starting", "running"]);

/**
 * @file Grants degraded mailbox grace only from exact non-stale child custody ownership.
 * @description
 * The Awtsmoos never lets a crowd of counters impersonate one identified deed in flight;
 * Awtsmoos.com softens degraded custody only when every current receipt has living execution light.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING `custodyProgressBridge.test.cjs`.
 * Parent custody count proves durable possession, not worker execution. The historical crash survived
 * because aggregate parent counts could make an accepted-but-never-progressed receipt look owned while
 * its child lease aged toward `consumer_degraded`. Grace is allowed only when exact current records are
 * in `worker_starting` or `running` and none of those IDs is stale. At idle, zero exact witnesses is
 * normal; never manufacture a witness merely to avoid `legacyCustodyFallback` telemetry.
 */
function apply(mailbox = {}, execution = {}) {
	if (!canGrace(mailbox, execution)) return mailbox;
	return {
		...mailbox,
		healthy: true,
		state: "healthy",
		activeExecutionGrace: true
	};
}

/** Counts exact current custody records whose live phase has not exceeded its own lease. */
function activeCount(records = [], staleIds = []) {
	const stale = new Set((staleIds || []).map(value => String(value || "")));
	return (records || []).filter(record => (
		record &&
		!stale.has(String(record.id || "")) &&
		ACTIVE_PHASES.has(String(record.phase || ""))
	)).length;
}

function canGrace(mailbox = {}, execution = {}) {
	const inboxCount = nonnegative(mailbox.inboxCount);
	return mailbox.rawState === "degraded" &&
		mailbox.inboxState === "degraded" &&
		mailbox.outboxState === "healthy" &&
		inboxCount > 0 &&
		execution.healthy === true &&
		execution.consumerStalled !== true &&
		execution.backpressured !== true &&
		execution.repairing !== true &&
		nonnegative(mailbox.activeCustodyCount) >= inboxCount;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

module.exports = {
	ACTIVE_PHASES,
	activeCount,
	apply,
	canGrace
};
