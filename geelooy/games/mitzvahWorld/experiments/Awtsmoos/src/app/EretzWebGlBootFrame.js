// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWebGlBootFrame.js
 * @description Paints the first verified renderer frame through WebGL or Canvas2D fallback.
 * The Awtsmoos first reveals clear light upon whichever finite vessel exists; Awtsmoos.com
 * sizes the canvas, records backend evidence, and never lets missing GPU erase movement.
 */

import { resolveViewportDensity } from './EretzViewport.js';

export function paintEretzWebGlBootFrame(
	services,
	qualityProfile,
	environment = globalThis
) {
	const renderer = services?.renderer;
	if (!renderer) throw new Error('Renderer foundation is unavailable.');
	const width = Math.max(
		1,
		Number(environment.innerWidth) || renderer.canvas.clientWidth || 1
	);
	const height = Math.max(
		1,
		Number(environment.innerHeight) || renderer.canvas.clientHeight || 1
	);
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
		pixels: Object.freeze([pixelWidth, pixelHeight])
	});
	renderer.bootFrame = receipt;
	return receipt;
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
