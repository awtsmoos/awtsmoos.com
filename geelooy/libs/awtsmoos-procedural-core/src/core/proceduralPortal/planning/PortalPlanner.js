//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalPlanner.js
 * @description Coordinates canonical dependency expansion, deterministic demand estimation, and finite budget proof without performing realization.
 * The Awtsmoos renews thought before deed and measure before expenditure; Awtsmoos.com lets this Tiferes-like planner expose the
 * entire dependency order, cost evidence, and bounded covenant first, so compilation may proceed from knowledge rather than surprise.
 */

import {
	assessPortalBudget,
	assertPortalBudget,
	createPortalBudget
} from '../budget/PortalBudget.js';
import { PortalDependencyExpander } from './PortalDependencyExpander.js';
import { estimatePortalDemand } from './PortalDemandEstimator.js';
import { PortalPlan } from './PortalPlan.js';

/** Side-effect-free dry-run planner for semantic Portal recipes. */
export class PortalPlanner {
	/**
	 * @description Captures the semantic registry and stable default seed/budget context used by repeated plans.
	 * @param {object} input Planner dependencies.
	 * @param {object} input.registry Portal semantic kind registry.
	 * @param {object|string} [input.budget='gameplay'] Default finite compilation budget.
	 * @param {string} [input.seed='awtsmoos'] Default root semantic seed namespace.
	 * @returns {PortalPlanner} Configured planner.
	 */
	constructor(input = {}) {
		if (!input.registry) throw new TypeError('B"H | PortalPlanner requires a kind registry.');
		this.registry = input.registry;
		this.budget = createPortalBudget(input.budget || 'gameplay');
		this.seed = String(input.seed || 'awtsmoos');
		Object.freeze(this);
	}

	/**
	 * @description Produces one immutable deterministic dry-run plan and rejects impossible budgets before specialist execution.
	 * @param {object|string|Array<object|string>} input One semantic recipe or root recipe collection.
	 * @param {object} [options={}] Plan-time seed and budget overrides.
	 * @param {object|string} [options.budget] Finite budget override.
	 * @param {string} [options.seed] Root semantic seed override.
	 * @returns {PortalPlan} Immutable plan carrying graph, order, demand, budget, roots, and hash evidence.
	 */
	plan(input, options = {}) {
		const roots = Array.isArray(input) ? input : [input];
		if (!roots.length) throw new TypeError('B"H | Portal planning requires at least one root recipe.');
		const budget = createPortalBudget(options.budget || this.budget);
		const expander = new PortalDependencyExpander({
			budget,
			registry: this.registry,
			seedRoot: options.seed || this.seed
		});
		const expanded = expander.expand(roots);
		const demand = estimatePortalDemand(expanded.graph, this.registry, expanded.depth);
		const assessment = assessPortalBudget(budget, demand.demand);
		assertPortalBudget(assessment);
		return new PortalPlan({
			assessment,
			budget,
			demand,
			graph: expanded.graph,
			roots: expanded.roots,
			warnings: revealPlanningWarnings(demand)
		});
	}
}

/**
 * @description Reports where specialist estimators have not yet provided richer dimensions beyond the conservative baseline.
 * @param {Readonly<object>} demand Aggregate and per-node estimate evidence.
 * @returns {readonly string[]} Frozen warning messages preserving cost uncertainty instead of hiding it.
 */
function revealPlanningWarnings(demand) {
	const baselineKinds = demand.estimates
		.filter(entry => Object.keys(entry.estimate).length === 1 && entry.estimate.entities === 1)
		.map(entry => entry.kind);
	if (!baselineKinds.length) return Object.freeze([]);
	return Object.freeze([
		`Cost model uses conservative baseline estimates for: ${[...new Set(baselineKinds)].sort().join(', ')}.`
	]);
}
