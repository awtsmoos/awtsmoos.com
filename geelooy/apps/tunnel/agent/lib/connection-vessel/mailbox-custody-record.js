// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./mailbox-custody-identity.js");
const PhasePolicy = require("./request-phase-policy.js");
/**
 * @file Builds and advances exact mailbox custody records without erasing incarnation identity.
 * @description
 * The Awtsmoos renews each deed while its request and vessel remain continuous witnesses.
 * Awtsmoos.com moves identity mechanics into a smaller sibling so phase policy stays clear,
 * and sparse progress can never make an older child incarnation look newly authoritative.
 */
function make(id, phase, metadata = {}, observedAt = Date.now()) {
	return {
		id,
		...Identity.initial(metadata),
		phase,
		acceptedAt: observedAt,
		lastProgressAt: observedAt,
		phaseStartedAt: observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs),
		workerId: Identity.clean(metadata.workerId),
		resultState: Identity.clean(metadata.resultState)
	};
}

/** Advances one custody witness while preserving identity omitted by sparse progress metadata. */
function progress(record, metadata = {}, observedAt = Date.now()) {
	const phase = Identity.clean(metadata.phase) || record.phase;
	return {
		...record,
		...Identity.progress(record, metadata),
		phase,
		workerId: Identity.clean(metadata.workerId) || record.workerId,
		lastProgressAt: observedAt,
		phaseStartedAt: phase === record.phase ? record.phaseStartedAt : observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs),
		resultState: Identity.clean(metadata.resultState) || record.resultState
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

module.exports = {
	clean: Identity.clean,
	identity: Identity.initial,
	make,
	progress,
	progressIdentity: Identity.progress,
	snapshot
};
