// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PrepareMaintenance
 * @description
 * The Awtsmoos opens one bounded offline gate: recover orphaned state, discover real
 * work, build candidates, clean allowlisted derivations, and either seal readiness
 * or return to idle. Every thrown error also returns the state machine to idle.
 */

const { fullInventory } = require('./inventory.js');
const { maintenanceDecision } = require('./decision.js');
const { buildFamilyCandidate } = require('./vacuumFamily.js');
const { installBatch } = require('./installBatch.js');
const { cleanupDerived } = require('./cleanupDerived.js');
const { clearState, readState, writeState } = require('./state.js');
const { recoverMutableState } = require('./stateRecovery.js');

function runId(now = new Date()) {
	return `run-${now.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}Z$/, 'Z')}`;
}

function prepareMaintenance(policy) {
	const recovery = recoverMutableState(policy, readState(policy));
	const state = recovery.state;
	if (state.status === 'pending-readiness') {
		return { state, recovery, reusedPending: true };
	}
	const before = fullInventory(policy, { verify: true });
	const decision = maintenanceDecision(before, policy);
	if (!decision.maintenanceRequired) {
		return {
			state,
			recovery,
			before,
			decision,
			changed: recovery.recovered
		};
	}
	return executeMaintenance(policy, before, decision, recovery);
}

function executeMaintenance(policy, before, decision, recovery) {
	const currentRunId = runId();
	writeState(policy, {
		status: 'building',
		pendingRunId: currentRunId,
		decision
	});
	try {
		const candidates = decision.families
			.filter(family => family.due)
			.map(family => buildFamilyCandidate(
				policy,
				family,
				currentRunId
			));
		const derived = cleanupDerived(policy, { dryRun: false });
		if (!candidates.length) {
			return finishDerivedOnly(
				policy,
				before,
				decision,
				derived,
				recovery
			);
		}
		const installations = installBatch(candidates, policy, currentRunId);
		const pending = writeState(policy, {
			status: 'pending-readiness',
			pendingRunId: currentRunId,
			before,
			decision,
			derived,
			installations
		});
		return {
			state: pending,
			recovery,
			before,
			decision,
			candidates,
			installations,
			changed: true
		};
	} catch (error) {
		clearState(policy, {
			maintenanceFailed: true,
			message: error.message,
			code: error.code || null,
			decision
		});
		throw error;
	}
}

function finishDerivedOnly(policy, before, decision, derived, recovery) {
	const after = fullInventory(policy, { verify: false });
	const result = { derivedOnly: true, before, decision, derived, after };
	return {
		state: clearState(policy, result),
		recovery,
		...result,
		changed: derived.removed.length > 0
	};
}

module.exports = {
	executeMaintenance,
	finishDerivedOnly,
	prepareMaintenance,
	runId
};