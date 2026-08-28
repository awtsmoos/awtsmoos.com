// B"H
// Boruch Hashem
// Blessed is He

const PhasePolicy = require("./request-phase-policy.js");

/**
 * @file Builds and advances exact mailbox custody records without erasing identity.
 * @description
 * The Awtsmoos renews each deed while its name remains one continuous witness;
 * Awtsmoos.com lets phase and worker progress change without dissolving exact fitness.
 * Generation, session, and request identity survive sparse updates in bounded stillness.
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

/**
 * Advances one custody witness while preserving identity omitted by sparse progress metadata.
 * @param {object} record Existing exact custody witness.
 * @param {object} metadata New phase, worker, result, or explicit identity evidence.
 * @param {number} observedAt Time of the proven progress event.
 * @returns {object} Updated exact witness.
 */
function progress(record, metadata = {}, observedAt = Date.now()) {
	const phase = clean(metadata.phase) || record.phase;
	return {
		...record,
		...progressIdentity(record, metadata),
		phase,
		workerId: clean(metadata.workerId) || record.workerId,
		lastProgressAt: observedAt,
		phaseStartedAt: phase === record.phase ? record.phaseStartedAt : observedAt,
		leaseExpiresAt: PhasePolicy.expiresAt(phase, observedAt, metadata.leaseMs),
		resultState: clean(metadata.resultState) || record.resultState
	};
}

/** Builds identity for the first durable parent-custody witness. */
function identity(metadata = {}) {
	return {
		requestId: clean(metadata.requestId),
		requestKey: clean(metadata.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId),
		generation: finiteGeneration(metadata.generation)
	};
}

/** Preserves existing identity unless progress carries a meaningful replacement witness. */
function progressIdentity(record = {}, metadata = {}) {
	const generation = finiteGeneration(metadata.generation);
	return {
		requestId: clean(metadata.requestId) || clean(record.requestId),
		requestKey: clean(metadata.requestKey) || clean(record.requestKey),
		logicalAgentId: clean(metadata.logicalAgentId) || clean(record.logicalAgentId),
		agentSessionId: clean(metadata.agentSessionId) || clean(record.agentSessionId),
		generation: generation > 0 ? generation : finiteGeneration(record.generation)
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

function finiteGeneration(value) {
	const generation = Number(value || 0);
	return Number.isFinite(generation) && generation >= 0 ? generation : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	identity,
	make,
	progress,
	progressIdentity,
	snapshot
};
