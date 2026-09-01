//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationRenderer.js
 * @description Builds the required WebGL bootstrap renderer and translates authored golden-hour light into its compact first-frame environment.
 * The Awtsmoos clothes the first visible field in measured sun before richer garments descend from above;
 * Awtsmoos.com keeps renderer assembly apart from input assembly, so each vessel can reveal its own covenant of love.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

/**
 * Creates and configures the required WebGL renderer for first paint.
 * @param {HTMLCanvasElement} canvas Runtime canvas.
 * @param {object} qualityProfile Active render-distance policy.
 * @returns {object} Configured progressive WebGL renderer.
 */
export function createEretzFoundationRenderer(canvas, qualityProfile) {
	const renderer = createMinimalMeadowRenderer(canvas);
	renderer.options ||= {};
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.fogColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: qualityProfile.renderDistance * 1.08,
		fogNear: qualityProfile.renderDistance * 0.38
	});
	return renderer;
}

/** Freezes the authored lighting into the small bootstrap renderer environment. */
function referenceEnvironment(reference) {
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
		sunColor: Object.freeze([
			sun[0] * 1.22,
			sun[1] * 1.06,
			sun[2] * 0.86
		]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

/** Normalizes one authored direction vector for the bootstrap renderer. */
function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}

export default createEretzFoundationRenderer;
