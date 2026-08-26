// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPlan.js
 * @description Builds immutable JSON-safe Reality graphs by delegating node construction, defaults, validation, and topological ordering to focused modules.
 * The Awtsmoos renews the whole before node, edge, profile, seed, and order appear as many;
 * Awtsmoos.com keeps this planner small so inspection remains simple while deeper graph laws reveal every deterministic vessel plainly.
 */
import { createRealityIntentDefaults } from './RealityIntentDefaults.js';
import { createRealityIntentGraphIndex } from './RealityIntentGraphIndex.js';
import { createRealityIntentExecutionOrder } from './RealityIntentGraphOrder.js';
import { expandRealityIntentInput } from './RealityIntentInput.js';
import { freezeRealityIntentJson } from './RealityIntentJson.js';
import { createRealityIntentPlanNode } from './RealityIntentPlanNode.js';

export const REALITY_INTENT_PLAN_KIND = 'reality-intent-plan/v1';

/**
 * Creates one immutable non-realized Reality intent graph with validated dependencies and effective shared defaults.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {object} registryYesod Reality-exclusive intent registry.
 * @param {unknown} inputOhr String, object, preset request, or nested intent array.
 * @param {object} [optionsKeter={}] JSON-safe scene defaults including seed, quality, realism, environment, material, and specialist options.
 * @returns {Readonly<object>} Serializable deterministic plan containing authored nodes and dependency-safe execution order.
 */
export function createRealityIntentPlan(
	realityYesod,
	registryYesod,
	inputOhr,
	optionsKeter = {}
) {
	const defaultsBinah = createRealityIntentDefaults(realityYesod, optionsKeter);
	const expandedOros = expandRealityIntentInput(inputOhr);
	const nodesOros = expandedOros.map((sourceOhr, indexNetzach) => {
		return createRealityIntentPlanNode(
			realityYesod,
			registryYesod,
			sourceOhr,
			indexNetzach,
			defaultsBinah
		);
	});
	const byIdYesod = createRealityIntentGraphIndex(nodesOros);
	const executionOrder = createRealityIntentExecutionOrder(nodesOros, byIdYesod);
	return freezeRealityIntentJson({
		defaults: {
			...defaultsBinah.sharedOptions,
			quality: defaultsBinah.profile.quality,
			realism: defaultsBinah.profile.realism,
			seed: defaultsBinah.rootSeed
		},
		executionOrder,
		kind: REALITY_INTENT_PLAN_KIND,
		nodes: nodesOros,
		omittedRealityDefaults: defaultsBinah.omittedRealityDefaults,
		profile: defaultsBinah.profile,
		rootSeed: defaultsBinah.rootSeed,
		version: 1
	});
}

/**
 * Returns whether one value already carries the canonical Reality intent-plan contract.
 * @param {unknown} valueOhr Candidate plan-like value.
 * @returns {boolean} True only for current v1 Reality intent plans.
 */
export function isRealityIntentPlan(valueOhr) {
	return Boolean(
		valueOhr
		&& valueOhr.kind === REALITY_INTENT_PLAN_KIND
		&& Array.isArray(valueOhr.nodes)
		&& Array.isArray(valueOhr.executionOrder)
	);
}
