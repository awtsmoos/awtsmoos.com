//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalSimulation.js
 * @description Plans semantic behavior and delegates time evolution only through an explicit simulator adapter, returning structured deferred evidence otherwise.
 * The Awtsmoos renews all time before simulation can count a frame; Awtsmoos.com lets finite behaviors declare their potential
 * while refusing to counterfeit motion when no runtime authority is installed, keeping every future simulation honest and elemental.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { invokePortalAdapter } from './PortalAdapterExecution.js';
import { portalAdapterOptions, portalPlanningOptions } from './PortalOperationOptions.js';

/**
 * @description Plans semantic intent, gathers node-owned declared behaviors, and either executes an installed simulator or returns truthful deferred evidence.
 * @param {object} portal ProceduralPortal-like facade exposing plan() and services.
 * @param {object|string|Array<object|string>} input Semantic intent to simulate.
 * @param {object} [options={}] Operation options containing planner seed/budget, optional simulator override, and explicit simulationOptions bag.
 * @returns {Promise<Readonly<object>>} Deferred frozen receipt or shallow-frozen executed adapter receipt.
 */
export async function simulatePortalIntent(portal, input, options = {}) {
	const planning = portalPlanningOptions(options);
	const simulationOptions = portalAdapterOptions(options, 'simulationOptions');
	const plan = portal.plan(input, planning);
	const evidence = createSimulationEvidence(plan);
	const simulator = options.simulator || portal.services.simulator;
	if (!simulator) {
		return freezeLanguageValue({
			...evidence,
			reason: 'No simulator adapter is installed for this Portal.',
			status: 'deferred',
			type: 'portal.simulation-result',
			version: 1
		});
	}
	const result = await invokePortalAdapter(simulator, 'simulate', Object.freeze({
		options: simulationOptions,
		plan,
		planData: plan.toJSON(),
		services: portal.services
	}));
	return Object.freeze({
		...evidence,
		result,
		status: 'executed',
		type: 'portal.simulation-result',
		version: 1
	});
}

/**
 * @description Summarizes planned kinds and preserves the owning graph node for every declared semantic behavior without claiming runtime implementation.
 * @param {object} plan Canonical PortalPlan instance.
 * @returns {object} Portable simulation capability evidence derived from the plan graph.
 */
function createSimulationEvidence(plan) {
	const behaviors = plan.graph.flatMap(node => (
		(node.recipe.behaviors || []).map(behavior => ({
			behavior,
			nodeId: node.id
		}))
	));
	return {
		behaviors,
		kinds: [...new Set(plan.graph.map(node => node.kind))].sort(),
		planHash: plan.hash,
		roots: plan.roots
	};
}
