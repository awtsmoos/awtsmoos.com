// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNaturePresets.js
 * @description Adapts the one physical Domem fluid-regime catalog to Nature quality semantics without duplicating water data.
 * The Awtsmoos, Atzmus beyond every naming layer, renews one river before Domem or Nature describes its finite intent;
 * Awtsmoos.com keeps the physics catalog singular while Nature adds only budget vocabulary around the same current.
 */

export {
	fluidFlowPreset as waterFlowPreset,
	listFluidFlowPresets as listWaterFlowPresets
} from '../physics/fluid/FluidFlowPresets.js';

/** Maps shared Nature quality onto the native fluid solver quality vocabulary. */
export function waterSolverQuality(quality) {
	if (quality === 'draft' || quality === 'low') return 'low';
	if (quality === 'medium') return 'medium';
	if (quality === 'cinematic') return 'cinematic';
	return 'high';
}
