// B"H
// Boruch Hashem
// Blessed is He

const MAX_REPEAT_HANDOFFS = 4;

/**
 * @file Persists successor reservations, activation outcomes, and same-work loop protection.
 * @description
 * The Awtsmoos gives continuation memory before side effects begin; Awtsmoos.com reserves
 * one terminal key, remembers the planned successor, and turns a circling unresolved task
 * into review after four handoffs instead of spawning an endless procession in the dark.
 */
function ensure(mission = {}) {
	mission.successorLedger ||= { records: [], fingerprints: {} };
	mission.successorLedger.records ||= [];
	mission.successorLedger.fingerprints ||= {};
	return mission.successorLedger;
}

function find(mission, terminalKey) {
	return ensure(mission).records.find(record => record.terminalKey === terminalKey) || null;
}

function repeatCount(mission, fingerprint) {
	return Number(ensure(mission).fingerprints[fingerprint] || 0);
}

function loopBlocked(mission, fingerprint) {
	return repeatCount(mission, fingerprint) >= MAX_REPEAT_HANDOFFS;
}

function reserve(mission, input = {}) {
	const existing = find(mission, input.terminalKey);
	if (existing) return existing;
	const record = {
		terminalKey: input.terminalKey,
		predecessorId: input.predecessorId,
		workFingerprint: input.workFingerprint,
		state: "reserved",
		reason: input.reason,
		work: input.work,
		activation: input.activation || null,
		successorId: input.successorId || null,
		reused: input.reused === true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
	ensure(mission).records.push(record);
	return record;
}

function issued(mission, record, receipt = {}) {
	record.state = "issued";
	record.successorId = receipt.successorId || record.successorId;
	record.delegationId = receipt.delegationId || record.delegationId || null;
	record.claimId = receipt.claimId || record.claimId || null;
	record.activationReceipt = receipt.activationReceipt || null;
	record.updatedAt = new Date().toISOString();
	const counts = ensure(mission).fingerprints;
	counts[record.workFingerprint] = repeatCount(mission, record.workFingerprint) + 1;
	return record;
}

function finish(mission, record, state, reason) {
	record.state = state;
	record.reason = reason || record.reason;
	record.updatedAt = new Date().toISOString();
	return record;
}

function compact(record = {}) {
	return {
		terminalKey: record.terminalKey,
		state: record.state,
		predecessorId: record.predecessorId,
		successorId: record.successorId || null,
		reused: record.reused === true,
		reason: record.reason,
		workFingerprint: record.workFingerprint,
		activationMode: record.activation?.mode || null,
		delegationId: record.delegationId || null,
		claimId: record.claimId || null
	};
}

module.exports = {
	MAX_REPEAT_HANDOFFS,
	compact,
	ensure,
	find,
	finish,
	issued,
	loopBlocked,
	repeatCount,
	reserve
};
