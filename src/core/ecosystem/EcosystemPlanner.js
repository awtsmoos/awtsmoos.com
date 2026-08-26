// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemPlanner.js
 * @description Coordinates vegetation, fauna, optional river motion, and optional spatial river-world evidence without owning them.
 * The Awtsmoos joins many living domains without erasing their boundaries; Awtsmoos.com keeps this Tiferes coordinator thin
 * so populations, fluid motion, habitat, crossings, and river form may grow independently while one world preserves their kin.
 */

import { planCreaturePopulation } from './CreaturePopulationPlanner.js';
import { createEcosystemRiverContext } from './EcosystemRiverContext.js';
import { createRiverFlowRuntime } from './RiverFlowPlanner.js';
import { planVegetationPopulation } from './VegetationPopulationPlanner.js';

/** Plans one deterministic ecological world from shared habitat and optional river evidence. */
export function planEcosystem(options = {}) {
	const riverContext = createEcosystemRiverContext(options);
	const shared = {
		bounds: options.bounds,
		habitatAt: riverContext?.habitatAt ?? options.habitatAt,
		heightAt: options.heightAt,
		seed: options.seed
	};
	const vegetation = planVegetationPopulation({
		...shared,
		exclusionAt: riverContext?.vegetationExclusionAt ?? options.exclusionAt,
		...(options.vegetation || {})
	});
	const creatures = planCreaturePopulation({
		...shared,
		exclusionAt: riverContext?.creatureExclusionAt ?? options.exclusionAt,
		...(options.creatures || {})
	});
	const river = options.river ? createRiverFlowRuntime(options.river) : null;
	const diagnostics = {
		creatureCount: creatures.placements.length,
		hasRiverRuntime: Boolean(river),
		vegetationCount: vegetation.placements.length
	};
	if (riverContext) diagnostics.hasRiverReach = true;
	return Object.freeze({
		creatures,
		diagnostics: Object.freeze(diagnostics),
		river,
		...(riverContext ? riverWorldEvidence(riverContext) : {}),
		vegetation
	});
}

function riverWorldEvidence(context) {
	return {
		riverCrossings: context.crossings,
		riverInfluence: context.influence,
		riverReach: context.plan
	};
}
