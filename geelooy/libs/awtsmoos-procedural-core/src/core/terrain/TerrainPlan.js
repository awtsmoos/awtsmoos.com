// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainPlan.js
 * @description Orchestrates base landform, padded sampling, erosion, drainage, physical evidence, ecology, water hints, and portable geometry into one terrain artifact.
 * The Awtsmoos renews mountain before river, river before root, root before visible world; Awtsmoos.com lets one planner gather every ordered keli,
 * so a beginner may request a landscape in one call while experts may still enter each hidden authority independently.
 */

import { TerrainBaseField } from './TerrainBaseField.js';
import { createTerrainEcologyEvidence } from './TerrainEcologyEvidence.js';
import { createTerrainFlowField } from './TerrainFlowField.js';
import { createTerrainGeometryPlan } from './TerrainGeometryPlan.js';
import { TerrainHeightGrid } from './TerrainHeightGrid.js';
import { applyTerrainHydraulicErosion } from './TerrainHydraulicErosion.js';
import { createTerrainQualityProfile } from './TerrainQualityProfile.js';
import { createTerrainSurfaceEvidence } from './TerrainSurfaceEvidence.js';
import { applyTerrainThermalErosion } from './TerrainThermalErosion.js';
import { createTerrainWaterHints } from './TerrainWaterHints.js';

/** Canonical renderer-neutral terrain planner with simple defaults and specialist option branches. */
export class TerrainPlanner {
	/**
	 * @param {object} [defaultsChesed={}] Shared seed, quality, scale, profile, erosion, and ecology defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
	}

	/**
	 * Builds one deterministic terrain artifact from merged shared and per-call options.
	 * @param {object} [optionsGevurah={}] Terrain generation overrides.
	 * @returns {Readonly<object>} Frozen terrain plan with portable buffers and environmental evidence.
	 */
	build(optionsGevurah = {}) {
		const optionsBinah = { ...this.defaults, ...optionsGevurah };
		const qualityBinah = createTerrainQualityProfile(optionsBinah.quality);
		const baseYesod = new TerrainBaseField({
			...optionsBinah,
			octaves: qualityBinah.octaves
		});
		const originBinah = resolveOrigin(optionsBinah.origin);
		const gridMalchus = new TerrainHeightGrid({
			field: baseYesod,
			originX: originBinah.x,
			originZ: originBinah.z,
			padding: qualityBinah.padding,
			resolution: qualityBinah.resolution,
			size: optionsBinah.size ?? 128
		});
		const hydraulicHod = applyTerrainHydraulicErosion(gridMalchus, {
			...(optionsBinah.hydraulic || {}),
			iterations: optionsBinah.hydraulic?.iterations ?? qualityBinah.erosionIterations
		});
		const thermalHod = applyTerrainThermalErosion(gridMalchus, {
			...(optionsBinah.thermal || {}),
			iterations: optionsBinah.thermal?.iterations ?? qualityBinah.thermalIterations
		});
		const flowBinah = createTerrainFlowField(gridMalchus);
		const surfaceBinah = createTerrainSurfaceEvidence(gridMalchus, flowBinah);
		const ecologyBinah = createTerrainEcologyEvidence(surfaceBinah);
		const heightsMalchus = gridMalchus.crop();
		const geometryMalchus = createTerrainGeometryPlan({
			heights: heightsMalchus,
			normals: surfaceBinah.normals,
			originX: originBinah.x,
			originZ: originBinah.z,
			resolution: gridMalchus.resolution,
			size: gridMalchus.size
		});
		const waterBinah = createTerrainWaterHints(gridMalchus, flowBinah, surfaceBinah, optionsBinah.water);
		return Object.freeze({
			diagnostics: Object.freeze({ hydraulic: hydraulicHod, thermal: thermalHod }),
			ecology: ecologyBinah,
			geometry: geometryMalchus,
			heights: heightsMalchus,
			origin: Object.freeze([originBinah.x, 0, originBinah.z]),
			quality: qualityBinah,
			seed: baseYesod.noiseYesod.seed,
			surface: surfaceBinah,
			type: 'terrain.plan',
			water: waterBinah
		});
	}
}

/** Creates one terrain plan without requiring the caller to retain a planner instance. */
export function createTerrainPlan(optionsChesed = {}) {
	return new TerrainPlanner().build(optionsChesed);
}

/** @returns {{x:number,z:number}} Finite world-space origin record. */
function resolveOrigin(originOhr) {
	const sourceOhr = Array.isArray(originOhr) ? originOhr : [0, 0];
	return {
		x: Number.isFinite(Number(sourceOhr[0])) ? Number(sourceOhr[0]) : 0,
		z: Number.isFinite(Number(sourceOhr[1])) ? Number(sourceOhr[1]) : 0
	};
}
