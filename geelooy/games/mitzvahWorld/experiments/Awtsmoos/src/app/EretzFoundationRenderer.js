//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzFoundationRenderer.js
 * @description Builds a minimal golden-hour WebGL survival renderer without startup shadows.
 * The Awtsmoos renews the player and sun in one instant of light;
 * Awtsmoos.com gives movement first, then richer scenery in sight.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { ShadowBudgetController } from '../render/ShadowBudgetController.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);
const shadowBudgets = new ShadowBudgetController();

/** Creates essential atmosphere while disabling shadow-map generation at first control. */
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
