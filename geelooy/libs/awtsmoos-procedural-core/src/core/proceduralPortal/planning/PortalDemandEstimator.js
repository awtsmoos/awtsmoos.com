//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalDemandEstimator.js
 * @description Aggregates only declared finite compilation demand, preserving unknown cost as evidence rather than inventing confidence.
 * The Awtsmoos is beyond every number while finite devices answer to number; Awtsmoos.com lets each semantic authority contribute
 * honest estimates for entities, geometry, textures, simulation, and other bounded vessels before the compiler spends one expensive breath.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

const DEMAND_KEYS = Object.freeze([
	'entities',
	'geometryVertices',
	'simulationMs',
	'textureMemoryMB'
]);

/**
 * @description Sums deterministic specialist estimates over a proven Portal graph without executing any specialist compiler.
 * @param {object} graph Verified Portal dependency graph.
 * @param {object} registry Semantic kind registry that owns optional estimator functions.
 * @param {number} depth Maximum dependency depth observed during expansion.
 * @returns {Readonly<object>} Frozen aggregate demand and per-node estimate evidence.
 */
export function estimatePortalDemand(graph, registry, depth) {
	const demand = {
		depth: Number(depth) || 0,
		entities: 0,
		geometryVertices: 0,
		nodes: graph.list().length,
		simulationMs: 0,
		textureMemoryMB: 0
	};
	const estimates = [];
	for (const node of graph.list()) {
		const definition = registry.resolve(node.kind);
		const estimate = revealPortalEstimate(definition, node.recipe);
		for (const key of DEMAND_KEYS) {
			demand[key] += normalizeDemandValue(estimate[key]);
		}
		estimates.push({
			estimate,
			id: node.id,
			kind: node.kind
		});
	}
	return freezeLanguageValue({ demand, estimates });
}

/**
 * @description Invokes one synchronous estimator or returns a conservative one-entity baseline when a specialist has no richer cost model.
 * @param {object} definition Installed Portal semantic-kind definition.
 * @param {Readonly<object>} recipe Canonical recipe being estimated.
 * @returns {object} JSON-safe finite demand fragment.
 */
function revealPortalEstimate(definition, recipe) {
	if (!definition.estimator) {
		return { entities: 1 };
	}
	const estimate = definition.estimator(recipe);
	if (estimate?.then) {
		throw createDemandError(
			'PORTAL_ASYNC_ESTIMATOR',
			`${definition.kind} estimator must remain synchronous.`
		);
	}
	if (!estimate || typeof estimate !== 'object' || Array.isArray(estimate)) {
		throw createDemandError(
			'PORTAL_ESTIMATE_INVALID',
			`${definition.kind} estimator must return an object.`
		);
	}
	return Object.fromEntries(
		Object.entries(estimate).map(([key, value]) => [key, normalizeDemandValue(value)])
	);
}

/**
 * @description Converts optional demand values into non-negative finite numbers and rejects impossible specialist cost evidence.
 * @param {*} value Candidate demand value.
 * @returns {number} Non-negative finite number.
 */
function normalizeDemandValue(value) {
	const numeric = Number(value ?? 0);
	if (!Number.isFinite(numeric) || numeric < 0) {
		throw createDemandError(
			'PORTAL_ESTIMATE_INVALID',
			`Demand estimates must be non-negative finite numbers: ${value}`
		);
	}
	return numeric;
}

/**
 * @description Creates one stable coded demand-estimation error for planners, generated editors, tests, and logs.
 * @param {string} code Machine-readable demand-estimation failure code.
 * @param {string} message Human-readable evidence describing the invalid estimator behavior.
 * @returns {Error} Error carrying the stable `code` property.
 */
function createDemandError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
