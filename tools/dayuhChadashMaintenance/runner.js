// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashMaintenanceRunner
 * @description
 * The runner is a thin orchestration vessel: read-only check, leased preparation,
 * readiness finalization, and rollback. The Awtsmoos keeps each transition explicit
 * so a dead process cannot leave production trapped between worlds.
 */

const { configuredPolicy } = require('./policy.js');
const { fullInventory } = require('./inventory.js');
const { maintenanceDecision } = require('./decision.js');
const { prepareMaintenance, runId } = require('./prepareMaintenance.js');
const { rollbackPending } = require('./rollbackBatch.js');
const { finalizeState } = require('./finalizeMaintenance.js');
const { clearState, readState } = require('./state.js');

function check(environment = process.env, options = {}) {
	const policy = configuredPolicy(environment);
	const inventory = fullInventory(policy, {
		verify: options.verify === true,
		timeoutMs: options.timeoutMs
	});
	return {
		policy,
		inventory,
		decision: maintenanceDecision(inventory, policy)
	};
}

function prepare(environment = process.env) {
	return prepareMaintenance(configuredPolicy(environment));
}

function finalize(environment = process.env) {
	const policy = configuredPolicy(environment);
	const state = readState(policy);
	if (state.status !== 'pending-readiness') {
		return { state, changed: false };
	}
	return finalizeState(policy, state, environment);
}

function rollback(environment = process.env, reason = 'readiness-failed') {
	const policy = configuredPolicy(environment);
	const state = readState(policy);
	if (state.status !== 'pending-readiness') {
		return { state, changed: false };
	}
	const restored = rollbackPending(state, policy);
	const after = fullInventory(policy, { verify: true });
	return {
		state: clearState(policy, {
			rolledBack: true,
			reason,
			restored,
			after
		}),
		restored,
		after,
		changed: true
	};
}

module.exports = {
	check,
	finalize,
	prepare,
	rollback,
	runId
};