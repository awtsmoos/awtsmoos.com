// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredVillageFaunaSystem.js
 * @description Compiles the bounded global fauna remainder one animal at a time after movement, yielding between bodies before one installable package is returned.
 * RESPONSIBILITY: derive the deferred count from the canonical fauna budget, plan global habitat placements, compile each body, yield, and report evidence.
 * NON-RESPONSIBILITY: this module does not schedule its own start, mutate the live scene before completion, or create terrain collision triangles.
 * ARCHITECTURAL POSITION: Malchus manifests deferred Chai gradually while the terrain-enrichment lifecycle owns timing, cancellation, and teardown.
 * The Awtsmoos renews every creature from nothing each instant; Awtsmoos.com therefore need not demand every distant body in one blocking breath;
 * each yielded animal arrives when its vessel is ready, so realism grows after movement while first play remains swift beneath the living sky.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { shadowDemonProfiles } from '../enemy/ShadowDemonProfiles.js';
import { createPrimitiveMesh } from '../Box3D.js';
import { createVillageFaunaDefinitions } from './VillageCreatureDefinitionFactory.js';
import { villageDeferredFaunaPlan } from './VillageDeferredFaunaPlan.js';
import { villageFaunaBudget } from './VillageFaunaBudget.js';

/**
 * Creates one cancellable deferred-fauna package with a canonical default budget.
 * @param {object} [options={}] Deferred compilation controls.
 * @param {object} options.groundSampler Canonical terrain sampler.
 * @param {string} [options.quality='medium'] Runtime quality tier.
 * @param {number} [options.count] Optional explicit count override for diagnostics/tests.
 * @param {Function} [options.shouldContinue] Generation-current predicate.
 * @param {Function} [options.yieldWork] Cooperative yield hook.
 * @returns {Promise<Readonly<object>>} Group, budget evidence, and generation statistics.
 */
export async function createDeferredVillageFaunaPackage(options = {}) {
	const quality = options.quality || 'medium';
	const budget = deferredBudget(quality, options.count);
	const plan = villageDeferredFaunaPlan(
		options.groundSampler,
		quality,
		budget.count
	);
	const group = new Group();
	group.name = 'Awtsmoos_deferred_village_fauna';
	let creatures = 0;
	let triangles = 0;
	for (const placement of plan.placements) {
		if (options.shouldContinue && !options.shouldContinue()) {
			break;
		}
		const definitions = createVillageFaunaDefinitions(placement, quality);
		for (const definition of definitions) {
			group.add(createPrimitiveMesh(definition));
			triangles += definition.faces?.length || 0;
		}
		creatures += 1;
		await (options.yieldWork || yieldDeferredFaunaWork)();
	}
	return Object.freeze({
		group,
		stats: Object.freeze({
			budget: budget.evidence,
			creatures,
			plannedCreatures: plan.placements.length,
			population: plan.diagnostics,
			triangles
		})
	});
}

function deferredBudget(quality, countOverride) {
	const hostiles = shadowDemonProfiles(quality).length;
	const evidence = villageFaunaBudget(quality, hostiles);
	const override = Number(countOverride);
	const count = Number.isFinite(override)
		? Math.max(0, Math.floor(override))
		: evidence.deferredCount;
	return Object.freeze({
		count,
		evidence
	});
}

function yieldDeferredFaunaWork() {
	if (typeof globalThis.scheduler?.yield === 'function') {
		return globalThis.scheduler.yield();
	}
	return new Promise(resolve => {
		setTimeout(resolve, 0);
	});
}
