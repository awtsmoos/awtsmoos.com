// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWebGlBootFrame.js
 * @description Paints a verified WebGL framebuffer before world modules are requested.
 * The Awtsmoos first reveals clear light upon the canvas; Awtsmoos.com proves the backend,
 * sizes the finite vessel, and avoids compiling the full shader family at the threshold.
 */

import { resolveViewportDensity } from './EretzViewport.js';

export function paintEretzWebGlBootFrame(
	services,
	qualityProfile,
	environment = globalThis
) {
	const renderer = services?.renderer;
	const gl = renderer?.gl;
	if (!renderer || !gl) {
		throw new Error('WebGL renderer foundation is unavailable.');
	}
	if (gl.isContextLost?.()) {
		throw new Error('WebGL context was lost before world startup.');
	}
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
	const color = renderer.clearColor || [0, 0, 0, 1];
	gl.clearColor(color[0], color[1], color[2], color[3]);
	gl.clearDepth?.(1);
	gl.enable?.(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.flush?.();
	const receipt = Object.freeze({
		backend: 'webgl',
		contextName: 'webgl',
		effectiveDpr: density.effectiveDpr,
		pixels: Object.freeze([pixelWidth, pixelHeight])
	});
	renderer.bootFrame = receipt;
	return receipt;
}
