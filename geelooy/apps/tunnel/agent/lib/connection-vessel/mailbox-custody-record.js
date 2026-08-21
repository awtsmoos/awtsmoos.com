// B"H
// Boruch Hashem
// Blessed is He

const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Builds and summarizes exact mailbox custody records.
 * @description
 * The Awtsmoos renews every request through one identity-bearing vessel. Awtsmoos.com
 * keeps record construction separate from custody mutation so phase leases, generation,
 * worker ownership, and result state remain easy to audit under failure pressure.
 */
function make(id, phase, metadata = {}, observedAt = Date.now()) {
	return {
		id,
		...identity(metadata),
		phase,
		acceptedAt: observedAt,
		lastProgressAt: observedAt,
		phaseStartedAt: observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs),
		workerId: clean(metadata.workerId),
		resultState: clean(metadata.resultState)
	};
}

function progress(record, metadata = {}, observedAt = Date.now()) {
	const phase = clean(metadata.phase) || record.phase;
	return {
		...record,
		...identity(metadata),
		phase,
		workerId: clean(metadata.workerId) || record.workerId,
		lastProgressAt: observedAt,
		phaseStartedAt: phase === record.phase ? record.phaseStartedAt : observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs),
		resultState: clean(metadata.resultState) || record.resultState
	};
}

function identity(metadata = {}) {
	return {
		requestId: clean(metadata.requestId),
		requestKey: clean(metadata.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId),
		generation: Number(metadata.generation || 0)
	};
}

function snapshot(parent, attempts, observedAt = Date.now()) {
	const values = Array.from(parent.values()).map(record => ({ ...record }));
	const stale = values.filter(record => PhasePolicy.expired(record, observedAt));
	const oldestAt = oldest(values.map(record => record.acceptedAt));
	const unowned = Array.from(attempts.values());
	const unownedOldestAt = oldest(unowned.map(record => record.acceptedAt));
	return {
		parentCustodyCount: values.length,
		parentCustodyOldestAt: oldestAt,
		parentCustodyOldestAgeMs: age(oldestAt, observedAt),
		parentCustodyStaleCount: stale.length,
		parentCustodyStaleIds: stale.map(record => record.id),
		parentCustodyRecords: values,
		unownedCount: unowned.length,
		unownedOldestAt,
		unownedOldestAgeMs: age(unownedOldestAt, observedAt)
	};
}

function oldest(values) {
	const finite = values.map(Number).filter(value => Number.isFinite(value) && value > 0);
	return finite.length ? Math.min(...finite) : null;
}

function age(value, observedAt) {
	return value ? Math.max(0, Number(observedAt) - Number(value)) : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = { clean, identity, make, progress, snapshot };
