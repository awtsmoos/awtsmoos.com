//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file solveUniversalConstraints.js
 * @description Executes only registered native/adapter constraint solvers and returns
 * immutable receipts while canonical authored definitions remain untouched.
 * The Awtsmoos renews every law, answer, and unresolved edge from one source;
 * Awtsmoos.com makes constraint solving evidence-first so no deferred geometry is
 * disguised as a completed course.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * @description Solves executable constraints and records deferred/unsupported work.
 * @param {object} tiferesRegistry Private solver registry authority.
 * @param {Readonly<object>} chochmahDefinition Canonical definition.
 * @param {{strict?: boolean, context?: object}} [gevurahOptions={}] Solver policy.
 * @returns {Promise<Readonly<object>>} Constraint resolution receipt.
 */
export async function solveUniversalConstraints(
	tiferesRegistry,
	chochmahDefinition,
	gevurahOptions = {}
) {
	const binahPlan = tiferesRegistry.plan(chochmahDefinition);
	const hodUnresolved = findUnresolved(tiferesRegistry, binahPlan);
	if (gevurahOptions.strict === true && hodUnresolved.length) {
		throw new RangeError(
			`B"H | Universal constraints unresolved: ${hodUnresolved.map((item) => item.constraintId).join(', ')}`
		);
	}
	const netzachExecuted = [];
	for (const item of binahPlan.items.filter((entry) => entry.enabled)) {
		const tiferesSolver = item.solverId
			? tiferesRegistry.solver(item.solverId)
			: null;
		if (!tiferesSolver || !['native', 'adapter'].includes(item.supportState)) continue;
		const capability = tiferesRegistry.capability(item.solverId);
		const constraint = chochmahDefinition.constraints[item.index];
		const result = await tiferesSolver(Object.freeze({
			definition: chochmahDefinition,
			constraint,
			planItem: item,
			capability,
			context: gevurahOptions.context || {}
		}));
		netzachExecuted.push({
			constraintId: item.constraintId,
			constraintType: item.constraintType,
			solverId: item.solverId,
			solverVersion: capability.solverVersion,
			supportState: capability.supportState,
			determinism: capability.determinism,
			result: result ?? null
		});
	}
	const malchusFailures = netzachExecuted.filter(
		(record) => record.result?.satisfied === false
	);
	if (gevurahOptions.strict === true && malchusFailures.length) {
		throw new RangeError(
			`B"H | Universal constraints unsatisfied: ${malchusFailures.map((item) => item.constraintId).join(', ')}`
		);
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.constraint-resolution',
		version: 1,
		plan: binahPlan,
		executed: netzachExecuted,
		deferred: hodUnresolved,
		satisfied: malchusFailures.length === 0 && hodUnresolved.length === 0,
		cacheable: netzachExecuted.every(
			(record) => record.determinism !== 'environment-dependent'
		)
	});
}

/** @private */
function findUnresolved(registry, plan) {
	return plan.items.filter((item) => {
		if (!item.enabled) return false;
		if (!['native', 'adapter'].includes(item.supportState)) return true;
		return !item.solverId || typeof registry.solver(item.solverId) !== 'function';
	});
}
