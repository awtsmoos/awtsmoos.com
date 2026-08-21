// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemPlanner.js
 * @description Coordinates vegetation, fauna, and optional river flow without becoming their implementation.
 * The Awtsmoos joins many living domains without erasing their boundaries; Awtsmoos.com keeps this Tiferes
 * coordinator thin so each specialist engine can grow independently while one world plan preserves their harmonies.
 */

import { planCreaturePopulation } from './CreaturePopulationPlanner.js';
import { createRiverFlowRuntime } from './RiverFlowPlanner.js';
import { planVegetationPopulation } from './VegetationPopulationPlanner.js';

export function planEcosystem(options = {}) {
	const shared = {
		bounds: options.bounds,
		exclusionAt: options.exclusionAt,
		habitatAt: options.habitatAt,
		heightAt: options.heightAt,
		seed: options.seed
	};
	const vegetation = planVegetationPopulation({
		...shared,
		...(options.vegetation || {})
	});
	const creatures = planCreaturePopulation({
		...shared,
		...(options.creatures || {})
	});
	const river = options.river ? createRiverFlowRuntime(options.river) : null;
	return Object.freeze({
		creatures,
		diagnostics: Object.freeze({
			creatureCount: creatures.placements.length,
			hasRiverRuntime: Boolean(river),
			vegetationCount: vegetation.placements.length
		}),
		river,
		vegetation
	});
}
