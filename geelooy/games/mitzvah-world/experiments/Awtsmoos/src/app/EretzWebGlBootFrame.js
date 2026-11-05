// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWebGlBootFrame.js
 * @description Paints the first verified renderer frame through WebGL only, refusing a zero-size viewport.
 * The Awtsmoos first reveals clear light upon one genuine vessel; Awtsmoos.com
 * sizes the canvas, records backend evidence, and names a zero-size canvas as its own
 * failure state instead of masking it behind a one-pixel render.
 */

import { resolveViewportDensity } from './EretzViewport.js';

export const ZERO_SIZE_CANVAS_CODE = 'ZERO_SIZE_CANVAS';

export function paintEretzWebGlBootFrame(
	services,
	qualityProfile,
	environment = globalThis
) {
	const renderer = services?.renderer;
	if (!renderer) throw new Error('Renderer foundation is unavailable.');
	const viewport = readRawViewport(renderer, environment);
	if (viewport.width <= 0 || viewport.height <= 0) {
		throw createZeroSizeCanvasError(viewport);
	}
	const width = Math.max(1, viewport.width);
	const height = Math.max(1, viewport.height);
	const density = resolveViewportDensity(
		environment.devicePixelRatio,
		qualityProfile.maxDpr,
		1
	);
	const pixelWidth = Math.max(1, Math.round(width * density.effectiveDpr));
	const pixelHeight = Math.max(1, Math.round(height * density.effectiveDpr));
	services.camera.aspect = width / height;
	renderer.setSize(pixelWidth, pixelHeight);
	if (renderer.gl) paintWebGl(renderer);
	else renderer.render(services.scene, services.camera);
	const receipt = Object.freeze({
		backend: renderer.backend || (renderer.gl ? 'webgl' : 'unknown'),
		contextName: renderer.contextName || (renderer.gl ? 'webgl' : null),
		effectiveDpr: density.effectiveDpr,
		fallbackEvidence: renderer.fallbackEvidence || null,
		pixels: Object.freeze([pixelWidth, pixelHeight]),
		viewportCss: Object.freeze([width, height])
	});
	renderer.bootFrame = receipt;
	return receipt;
}

/**
 * Reads the raw viewport without the Math.max(1, …) mask so a genuinely zero-size
 * canvas becomes its own failure state instead of a silent one-pixel render.
 */
function readRawViewport(renderer, environment) {
	const innerWidth = Number(environment.innerWidth);
	const innerHeight = Number(environment.innerHeight);
	const clientWidth = Number(renderer.canvas?.clientWidth);
	const clientHeight = Number(renderer.canvas?.clientHeight);
	const width = (Number.isFinite(innerWidth) && innerWidth > 0 ? innerWidth : 0)
		|| (Number.isFinite(clientWidth) && clientWidth > 0 ? clientWidth : 0);
	const height = (Number.isFinite(innerHeight) && innerHeight > 0 ? innerHeight : 0)
		|| (Number.isFinite(clientHeight) && clientHeight > 0 ? clientHeight : 0);
	return {
		clientHeight: Number.isFinite(clientHeight) ? clientHeight : 0,
		clientWidth: Number.isFinite(clientWidth) ? clientWidth : 0,
		height,
		innerHeight: Number.isFinite(innerHeight) ? innerHeight : 0,
		innerWidth: Number.isFinite(innerWidth) ? innerWidth : 0,
		width
	};
}

function createZeroSizeCanvasError(viewport) {
	const error = new Error(
		'Mitzvah World canvas viewport is zero-sized; first frame refused.'
	);
	error.name = 'ZeroSizeCanvasError';
	error.code = ZERO_SIZE_CANVAS_CODE;
	error.evidence = Object.freeze({ ...viewport });
	error.recoverable = false;
	return error;
}

function paintWebGl(renderer) {
	const gl = renderer.gl;
	if (gl.isContextLost?.()) {
		throw new Error('WebGL context was lost before world startup.');
	}
	const color = renderer.clearColor || [0, 0, 0, 1];
	gl.clearColor(color[0], color[1], color[2], color[3]);
	gl.clearDepth?.(1);
	gl.enable?.(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.flush?.();
}
