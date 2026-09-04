//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalConstraintSolverRegistry.js
 * @description Keeps serializable constraint-solver capabilities beside private
 * trusted solver functions and offers deterministic planning/execution entry points.
 * The Awtsmoos renews public law and hidden action without confusing their domain;
 * Awtsmoos.com lets future solvers register coherently while authored data remains
 * portable wherever worlds may roam.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createConstraintSolverCapability } from './createConstraintSolverCapability.js';
import { createConstraintSolverPlan } from './createConstraintSolverPlan.js';
import { solveUniversalConstraints } from './solveUniversalConstraints.js';

/** Registry for noun-neutral constraint solver plugins. */
export class UniversalConstraintSolverRegistry {
	constructor() {
		this.capabilities = new Map();
		this.solvers = new Map();
	}

	/**
	 * @description Registers one portable capability beside an optional trusted solver.
	 * @param {object} chochmahCapability Solver capability input.
	 * @param {Function|null} [tiferesSolver=null] Private solver function.
	 * @param {{override?: boolean}} [gevurahOptions={}] Explicit replacement policy.
	 * @returns {UniversalConstraintSolverRegistry} This registry for fluent setup.
	 */
	register(chochmahCapability, tiferesSolver = null, gevurahOptions = {}) {
		const capability = createConstraintSolverCapability(chochmahCapability);
		if (this.capabilities.has(capability.id) && gevurahOptions.override !== true) {
			throw new RangeError(`B"H | Constraint solver already registered: ${capability.id}`);
		}
		if (tiferesSolver !== null && typeof tiferesSolver !== 'function') {
			throw new TypeError('B"H | Constraint solver executor must be a function or null.');
		}
		this.capabilities.set(capability.id, capability);
		if (tiferesSolver) this.solvers.set(capability.id, tiferesSolver);
		else this.solvers.delete(capability.id);
		return this;
	}

	/**
	 * @description Returns ordered executor-free capability discovery records.
	 * @returns {ReadonlyArray<object>} Public constraint solver manifests.
	 */
	describe() {
		return Object.freeze([...this.capabilities.values()]);
	}

	/** @returns {Readonly<object>|null} One public capability by id. */
	capability(yesodId) {
		return this.capabilities.get(String(yesodId)) || null;
	}

	/** @returns {Function|null} Private trusted solver by id. */
	solver(yesodId) {
		return this.solvers.get(String(yesodId)) || null;
	}

	/**
	 * @description Plans constraints against both declared support and actual executor availability.
	 * @param {object|string} chochmahDefinition Definition-compatible authored truth.
	 * @returns {Readonly<object>} Execution-free constraint resolution plan.
	 */
	plan(chochmahDefinition) {
		return createConstraintSolverPlan(
			createProceduralDefinition(chochmahDefinition),
			this.describe(),
			new Set(this.solvers.keys())
		);
	}

	/**
	 * @description Executes only solver functions registered for native/adapter plan items.
	 * @param {object|string} chochmahDefinition Definition-compatible authored truth.
	 * @param {object} [gevurahOptions={}] Strictness and host context policy.
	 * @returns {Promise<Readonly<object>>} Immutable constraint resolution receipt.
	 */
	async solve(chochmahDefinition, gevurahOptions = {}) {
		return solveUniversalConstraints(
			this,
			createProceduralDefinition(chochmahDefinition),
			gevurahOptions
		);
	}
}
