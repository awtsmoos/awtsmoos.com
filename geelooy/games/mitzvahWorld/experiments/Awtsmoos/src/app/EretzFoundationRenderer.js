//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzFoundationRenderer.js
 * @description Builds required WebGL with a deep authored sky, warm haze, and real shader-ready golden-hour environment.
 * The Awtsmoos renews cool heaven, amber distance, black garment, and living grass in one ray;
 * Awtsmoos.com carries that truthful atmosphere from first control into the hydrated renderer without a painted display.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

export function createEretzFoundationRenderer(canvas, qualityProfile) {
	const renderer = createMinimalMeadowRenderer(canvas);
	const renderDistance = qualityProfile.renderDistance;
	renderer.options ||= {};
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = renderDistance;
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.skyColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: renderDistance,
		fogNear: renderDistance * 0.30
	});
	return renderer;
}

/**
 * Freezes the authored cinematic palette consumed by both bootstrap and hydrated rendering.
 * @param {object} reference Shared golden-hour source of truth.
 * @returns {Readonly<object>} Renderer environment with immutable color vectors.
 */
export function referenceEnvironment(reference) {
	const cinematic = reference.cinematic;
	const exposure = (
		cinematic.exposureMobile + cinematic.exposureDesktop
	) * 0.5;
	return Object.freeze({
		ambient: frozenColor(cinematic.ambient),
		exposure,
		fogColor: frozenColor(cinematic.fogColor),
		skyColor: frozenColor(cinematic.skyColor),
		sunColor: frozenColor(cinematic.sunColor),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

/** Copies one authored RGB vector so renderer state cannot mutate the shared preset. */
function frozenColor(color) {
	return Object.freeze([color[0], color[1], color[2]]);
}

/** Returns a unit direction while preserving a safe zero-vector fallback. */
function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}

export default createEretzFoundationRenderer;
