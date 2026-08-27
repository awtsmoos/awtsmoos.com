//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVegetationPlanner.js
 * @description Composes live shallow-water habitat evidence, canonical mixed guilds, and the proven deterministic vegetation population planner.
 * RESPONSIBILITY: provide one water-aware population doorway while preserving existing patch, spacing, exclusion, association, and diagnostics machinery.
 * NON-RESPONSIBILITY: this vessel does not scatter points itself, evolve water, generate plant geometry, or duplicate species catalogs.
 * The Awtsmoos renews current and community before one placement may appear on living ground;
 * Awtsmoos.com lets mayim speak through habitat while Tzomayach answers through the old proven planner, many forms gathered around one source profound.
 */
import { createShallowWaterHabitatSampler } from './ShallowWaterHabitatSampler.js';
import { planVegetationPopulation } from './VegetationPopulationPlanner.js';
import { createWaterVegetationGuilds } from './WaterVegetationGuilds.js';
import { createWaterVegetationPatchPolicy } from './WaterVegetationPatchPolicy.js';

/**
 * Plans deterministic flowers, grasses, carpets, mosses, ferns, shrubs, and vines from one shallow-water state.
 * @param {object} mayimState Canonical live shallow-water state.
 * @param {object} [keterOptions={}] Population, habitat, guild, patch, spacing, association, and exclusion options.
 * @returns {Readonly<object>} Frozen population placements and water-aware diagnostics.
 */
export function planWaterVegetationPopulation(
	mayimState,
	keterOptions = {}
) {
	assertWaterState(mayimState);
	const tiferesSpecies = Array.isArray(keterOptions.species)
		&& keterOptions.species.length
		? [...keterOptions.species]
		: [...createWaterVegetationGuilds(keterOptions.guilds || {})];
	const malchusPatchPolicy = createWaterVegetationPatchPolicy(
		mayimState,
		keterOptions
	);
	const chochmahHabitatAt = createShallowWaterHabitatSampler(
		mayimState,
		{
			...(keterOptions.hydrology || {}),
			baseHabitatAt: keterOptions.baseHabitatAt
				|| keterOptions.habitatAt
				|| (() => ({}))
		}
	);
	const binahPopulation = planVegetationPopulation({
		...keterOptions,
		...malchusPatchPolicy,
		habitatAt: chochmahHabitatAt,
		species: tiferesSpecies
	});
	return Object.freeze({
		diagnostics: Object.freeze({
			...binahPopulation.diagnostics,
			guildSpecies: tiferesSpecies.length,
			waterDriven: true
		}),
		placements: binahPopulation.placements
	});
}

/**
 * Refuses malformed simulation vessels before planner work begins.
 * @param {object} mayimState Candidate shallow-water state.
 * @throws {TypeError} When required height/velocity lattice data is missing.
 */
function assertWaterState(mayimState) {
	if (
		!mayimState?.height?.values
		|| !mayimState?.velocity?.x
		|| !mayimState?.velocity?.y
	) {
		throw new TypeError(
			'B"H | Water vegetation planning requires canonical shallow-water height and velocity grids.'
		);
	}
}
