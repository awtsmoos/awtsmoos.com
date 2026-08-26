// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterEnvironmentState.js
 * @description Resolves renderer-facing water state from explicit WaterSurfaceIntent/Snapshot evidence while preserving physically grounded defaults for legacy meshes.
 * The Awtsmoos renews the hidden water meaning before WebGL can manifest its shine; Awtsmoos.com lets one explicit `waterSurface` vessel carry physics-born optics into sight,
 * so old meshes still receive living fresh water while modern ponds, rivers, oceans, and fluid snapshots reveal their own measured light.
 */

import { createWaterSurfaceIntent } from '../../../water/surface/WaterSurfaceIntent.js';

/**
 * Creates one normalized water render state from an object and deterministic scene context.
 * @param {object} objectMalchus Render object optionally carrying `waterSurface` or `shaderVars.uWaterSurface`.
 * @param {object} contextBinah Scene draw context with currentTime and optional global shader variables.
 * @returns {Readonly<object>} Frozen surface intent, evidence, time, lighting, camera, and derived foam/turbulence state.
 */
export function createWaterEnvironmentState(
	objectMalchus,
	contextBinah
) {
	const globalsBinah = contextBinah.globalShaderVars || {};
	const shaderVarsBinah = objectMalchus.shaderVars || {};
	const candidateYesod = objectMalchus.waterSurface ??
		shaderVarsBinah.uWaterSurface ??
		globalsBinah.uWaterSurface ??
		null;
	const resolvedBinah = resolveSurfaceCandidate(
		candidateYesod,
		shaderVarsBinah
	);
	const evidenceBinah = resolvedBinah.evidence || {};
	const surfaceBinah = resolvedBinah.intent;
	return Object.freeze({
		ambientLight: freezeVector(globalsBinah.uAmbientLightColor, [0.2, 0.2, 0.2]),
		cameraPosition: freezeVector(contextBinah.cameraPos, [0, 3, 8]),
		directionalLight: freezeVector(globalsBinah.uDirectionalLightColor, [1, 1, 1]),
		foam: unit(surfaceBinah.optics.foam * 0.65 + unit(evidenceBinah.foamCoverage) * 0.8),
		lightDirection: freezeVector(globalsBinah.uLightDirection || contextBinah.lightDir, [0, 1, 0]),
		surface: surfaceBinah,
		time: finite(shaderVarsBinah.uWaterTime ?? globalsBinah.uWaterTime ?? contextBinah.currentTime, surfaceBinah.time),
		turbulence: Math.max(
			surfaceBinah.wave.turbulence,
			unit(evidenceBinah.turbulence)
		),
		type: 'webgl.water-environment-state'
	});
}

/** @returns {Readonly<object>} Canonical intent/evidence pair from supported render-facing surface shapes. */
function resolveSurfaceCandidate(candidateYesod, shaderVarsBinah) {
	const unwrappedYesod = candidateYesod?.value ?? candidateYesod;
	if (unwrappedYesod?.type === 'water.surface-snapshot') {
		return Object.freeze({
			evidence: unwrappedYesod.evidence || null,
			intent: unwrappedYesod.intent
		});
	}
	if (unwrappedYesod?.type === 'water.surface-intent') {
		return Object.freeze({
			evidence: null,
			intent: unwrappedYesod
		});
	}
	return Object.freeze({
		evidence: null,
		intent: createWaterSurfaceIntent({
			current: shaderVarsBinah.uWaterCurrent,
			depthHint: shaderVarsBinah.uWaterDepthHint,
			material: shaderVarsBinah.uWaterMaterial || 'fresh',
			preset: shaderVarsBinah.uWaterPreset || 'still'
		})
	});
}

/** @returns {Readonly<Array<number>>} Frozen finite vec3. */
function freezeVector(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr) ? valueOhr : fallbackOhr;
	return Object.freeze(fallbackOhr.map((fallbackTiferes, indexNetzach) => {
		return finite(sourceOhr[indexNetzach], fallbackTiferes);
	}));
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
