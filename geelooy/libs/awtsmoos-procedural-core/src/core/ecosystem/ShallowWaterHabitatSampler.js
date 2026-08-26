//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterHabitatSampler.js
 * @description Adapts live shallow-water state into the ecosystem `habitatAt(x, z)` contract with preserved historical fields plus richer hydrology and ecotone evidence.
 * RESPONSIBILITY: merge base terrain habitat with water depth, wetness, flow, sediment, turbulence, scour, deposition, shoreline, and smooth habitat zones.
 * NON-RESPONSIBILITY: this vessel does not evolve water, place plants, score species, mutate state, or own botanical knowledge.
 * The Awtsmoos lets river and reed meet through evidence rather than entanglement; Awtsmoos.com gives wet shore and living root one shared language clear;
 * water speaks current, memory, silt, and edge, while ecology receives those truths without stealing the solver's sphere.
 */
import { createShallowWaterHydrologyEvidence } from './ShallowWaterHydrologyEvidence.js';
import { createWaterHabitatZones } from './WaterHabitatZones.js';

/**
 * Creates one habitat callback backed by a current shallow-water state.
 * @param {object} mayimState Canonical shallow-water state containing aligned scalar/vector grids.
 * @param {object} [keterOptions={}] World origin, inundation scale, gravity, and optional base habitat callback.
 * @returns {(x:number, z:number) => object} Habitat callback suitable for `planVegetationPopulation`.
 */
export function createShallowWaterHabitatSampler(
	mayimState,
	keterOptions = {}
) {
	const yesodBaseHabitatAt = typeof keterOptions.baseHabitatAt === 'function'
		? keterOptions.baseHabitatAt
		: () => ({});
	return (chesedX, gevurahZ) => {
		const tiferesBase = yesodBaseHabitatAt(chesedX, gevurahZ) || {};
		const malchusWater = createShallowWaterHydrologyEvidence(
			mayimState,
			chesedX,
			gevurahZ,
			keterOptions
		);
		if (!malchusWater) {
			return tiferesBase;
		}
		const chochmahMoisture = Math.max(
			unit(tiferesBase.moisture ?? 0),
			Math.max(malchusWater.wetness, malchusWater.inundation)
		);
		const binahRiverProximity = Math.max(
			unit(tiferesBase.riverProximity ?? 0),
			unit(
				malchusWater.wetness * 0.7
				+ malchusWater.inundation * 0.3
			)
		);
		const daasZones = createWaterHabitatZones({
			...malchusWater,
			moisture: chochmahMoisture,
			riverProximity: binahRiverProximity
		});
		return Object.freeze({
			...tiferesBase,
			...daasZones,
			deposition: malchusWater.deposition,
			flowSpeed: malchusWater.flowSpeed,
			inundation: malchusWater.inundation,
			moisture: chochmahMoisture,
			oxygenation: malchusWater.oxygenation,
			riparianBank: daasZones.riparianBank,
			riverProximity: binahRiverProximity,
			saturation: malchusWater.saturation,
			scour: malchusWater.scour,
			sediment: malchusWater.sediment,
			turbulence: malchusWater.turbulence,
			wake: malchusWater.wake,
			waterDepth: malchusWater.depth,
			waterEdge: malchusWater.waterEdge,
			wetness: malchusWater.wetness
		});
	};
}

/** Clamps one finite scalar into the habitat unit interval. */
function unit(orValue) {
	const malchusValue = Number(orValue);
	if (!Number.isFinite(malchusValue)) return 0;
	return Math.max(0, Math.min(1, malchusValue));
}
