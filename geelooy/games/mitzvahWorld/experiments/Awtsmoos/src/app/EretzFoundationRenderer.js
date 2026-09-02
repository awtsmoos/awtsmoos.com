// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationRenderer.js
 * @description Builds required WebGL with a deliberate authored sky clear distinct from the distance-fog color.
 * The Awtsmoos stretches cool heaven above warm earth while one sun joins both in living light;
 * Awtsmoos.com keeps sky present from the first framebuffer through rich-renderer handoff, so no gray void crowns the sight.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

export function createEretzFoundationRenderer(canvas, qualityProfile) {
	const renderer = createMinimalMeadowRenderer(canvas);
	renderer.options ||= {};
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.skyColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: qualityProfile.renderDistance * 1.08,
		fogNear: qualityProfile.renderDistance * 0.38
	});
	return renderer;
}

/** Freezes one blue-golden sky and distance-fog environment from the shared authored lighting preset. */
export function referenceEnvironment(reference) {
	const cool = reference.coolShadow;
	const horizon = reference.horizonColor;
	const sun = reference.sunCore;
	return Object.freeze({
		ambient: Object.freeze([
			cool[0] * 0.78 + 0.145,
			cool[1] * 0.76 + 0.11,
			cool[2] * 0.72 + 0.09
		]),
		exposure: 1.30,
		fogColor: Object.freeze([
			cool[0] * 0.66 + horizon[0] * 0.34,
			cool[1] * 0.68 + horizon[1] * 0.32,
			cool[2] * 0.74 + horizon[2] * 0.26
		]),
		skyColor: Object.freeze([
			cool[0] * 0.58 + 0.18,
			cool[1] * 0.62 + 0.24,
			cool[2] * 0.70 + 0.27
		]),
		sunColor: Object.freeze([
			sun[0] * 1.22,
			sun[1] * 1.06,
			sun[2] * 0.86
		]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}

export default createEretzFoundationRenderer;
