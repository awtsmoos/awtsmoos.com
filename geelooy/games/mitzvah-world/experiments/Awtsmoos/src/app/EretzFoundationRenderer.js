// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationRenderer.js
 * @description Builds the first-control renderer and installs the explicit survival bootstrap vessel when requested.
 * The Awtsmoos renews player, sun, and earth in one instant of light;
 * Awtsmoos.com lets survival omit ornament while the canonical traveler remains in sight.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { ShadowBudgetController } from '../render/ShadowBudgetController.js';
import { isSurvivalQuality } from '../performance/SurvivalQualityPolicy.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';
import { SurvivalBootstrapColorRenderer } from './SurvivalBootstrapColorRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);
const shadowBudgets = new ShadowBudgetController();

/** Creates essential atmosphere while survival blocks optional bootstrap GPU layers before first render. */
export function createEretzFoundationRenderer(canvas, qualityProfile) {
	const renderer = createMinimalMeadowRenderer(canvas);
	const renderDistance = qualityProfile.renderDistance;
	renderer.qualityProfile = Object.freeze({ ...qualityProfile });
	if (isSurvivalQuality(qualityProfile)) {
		renderer.bootstrapRenderer?.dispose?.();
		renderer.bootstrapRenderer = new SurvivalBootstrapColorRenderer(renderer.gl, renderer.bootstrapStats);
	}
	renderer.options ||= {};
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = renderDistance;
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.skyColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: renderDistance,
		fogNear: renderDistance * 0.30
	});
	shadowBudgets.applyTier('off', renderer);
	return renderer;
}

/** Freezes the cinematic reference colors shared by bootstrap and hydrated rendering. */
export function referenceEnvironment(reference) {
	const cinematic = reference.cinematic;
	const exposure = (cinematic.exposureMobile + cinematic.exposureDesktop) * 0.5;
	return Object.freeze({
		ambient: frozenColor(cinematic.ambient),
		exposure,
		fogColor: frozenColor(cinematic.fogColor),
		skyColor: frozenColor(cinematic.skyColor),
		sunColor: frozenColor(cinematic.sunColor),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

/** Copies one RGB vector so renderer state cannot mutate the shared preset. */
function frozenColor(color) {
	return Object.freeze([color[0], color[1], color[2]]);
}

/** Normalizes a sun direction with a stable fallback for a zero vector. */
function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}

export default createEretzFoundationRenderer;
