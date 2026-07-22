// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzViewport.js
 * @description Keeps the framebuffer sharp while allowing only density-safe adaptation.
 * The Awtsmoos recreates every mountain edge and letter each instant; Awtsmoos.com refuses to
 * stretch a smaller blurry picture across the screen and never falls below one rendered pixel
 * for each CSS pixel, while dense displays remain capped so motion still has a finite vessel.
 */

import { MAX_RENDER_DPR } from './EretzConstants.js';

const DEFAULT_RENDER_SCALE = 1;
const MAXIMUM_RENDER_SCALE = 1;
const MINIMUM_EFFECTIVE_DPR = 1;

export function installViewport(runtime, environment = globalThis) {
	if (!Number.isFinite(runtime.adaptiveRenderScale)) {
		runtime.adaptiveRenderScale = DEFAULT_RENDER_SCALE;
	}
	const resize = () => {
		const width = Math.max(1, Number(environment.innerWidth) || 1);
		const height = Math.max(1, Number(environment.innerHeight) || 1);
		const maximumDpr = runtime.qualityProfile?.maxDpr ?? MAX_RENDER_DPR;
		const density = resolveViewportDensity(
			environment.devicePixelRatio,
			maximumDpr,
			runtime.adaptiveRenderScale
		);
		runtime.minimumRenderScale = density.minimumScale;
		runtime.adaptiveRenderScale = density.scale;
		runtime.camera.aspect = width / height;
		runtime.renderer.setSize(
			Math.max(1, Math.round(width * density.effectiveDpr)),
			Math.max(1, Math.round(height * density.effectiveDpr))
		);
		publishViewportStats(runtime, density);
	};
	runtime.resizeViewport = resize;
	environment.addEventListener?.('resize', resize, { passive: true });
	resize();
	return resize;
}

/**
 * Resolves a density contract whose adaptive floor can reduce expensive Retina work but can
 * never undersample ordinary CSS pixels.
 */
export function resolveViewportDensity(deviceDpr, profileMaximumDpr, requestedScale) {
	const availableDpr = Math.max(1, Number(deviceDpr) || 1);
	const maximumDpr = Math.max(1, Number(profileMaximumDpr) || 1);
	const cappedDpr = Math.min(availableDpr, maximumDpr);
	const minimumScale = Math.min(
		MAXIMUM_RENDER_SCALE,
		MINIMUM_EFFECTIVE_DPR / cappedDpr
	);
	const scale = clamp(
		Number(requestedScale) || DEFAULT_RENDER_SCALE,
		minimumScale,
		MAXIMUM_RENDER_SCALE
	);
	return {
		cappedDpr,
		effectiveDpr: cappedDpr * scale,
		minimumScale,
		scale
	};
}

function publishViewportStats(runtime, density) {
	const stats = runtime.terrain.stats;
	stats.renderDpr = density.effectiveDpr;
	stats.renderScale = density.scale;
	stats.renderScaleFloor = density.minimumScale;
	stats.renderPixels = [
		runtime.renderer.canvas.width,
		runtime.renderer.canvas.height
	];
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
