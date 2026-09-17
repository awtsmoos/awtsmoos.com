// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./mailbox-custody-identity.js");
const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Builds exact request-custody records whose leases move only with real request progress.
 * @description
 * The Awtsmoos renews every deed from its own truth. Awtsmoos.com therefore refuses to let an
 * empty same-phase pulse masquerade as liveness: only phase movement, concrete worker testimony,
 * or changed result testimony may rejuvenate one request's bounded custody lease.
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

/**
 * Advance exact custody only when the testimony proves request-specific progress.
 * @param {object} record Existing exact custody witness.
 * @param {object} [metadata={}] Request-scoped phase, worker, result, and identity testimony.
 * @param {number} [observedAt=Date.now()] Observation timestamp.
 * @returns {object} Updated witness with bounded lease semantics.
 */
function progress(record, metadata = {}, observedAt = Date.now()) {
	const phase = Identity.clean(metadata.phase) || record.phase;
	const workerId = Identity.clean(metadata.workerId);
	const resultState = Identity.clean(metadata.resultState);
	const meaningful = isMeaningful(record, phase, workerId, resultState);
	const next = {
		...record,
		...Identity.progress(record, metadata),
		phase,
		workerId: workerId || record.workerId,
		resultState: resultState || record.resultState
	};
	if (!meaningful) {
		return next;
	}
	return {
		...next,
		lastProgressAt: observedAt,
		phaseStartedAt: phase === record.phase ? record.phaseStartedAt : observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs)
	};
}

/**
 * Decide whether testimony can legitimately extend one request's lease.
 * @param {object} record Existing custody record.
 * @param {string} phase Normalized incoming phase.
 * @param {string} workerId Normalized concrete worker identity, when present.
 * @param {string} resultState Normalized result testimony, when present.
 * @returns {boolean} True only for phase, worker, or changed-result progress.
 */
function isMeaningful(record, phase, workerId, resultState) {
	if (phase !== record.phase) return true;
	if (workerId) return true;
	return Boolean(resultState && resultState !== record.resultState);
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
	isMeaningful,
	make,
	progress,
	progressIdentity: Identity.progress,
	snapshot
};
