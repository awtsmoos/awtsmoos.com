// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-programs.js
 * @description Compiles one unified program sized to the GPU's lawful material-stack capacity.
 * The Awtsmoos does not become divided when stone rests and a Chossid walks; Awtsmoos.com
 * measures sampler capacity before shader creation so richer earth never causes link failure.
 */

import { rendererLocations } from './tiny-render-locations.js';
import {
	fragmentShaderForLayerCount,
	unifiedTextureVertexShader,
	unifiedUniformVertexShader
} from './tiny-render-shaders.js';
import { terrainLayerCapacity } from './tiny-terrain-layer-policy.js';
import { createProgram } from './tiny-render-webgl-utils.js';

export function initializeRendererPrograms(renderer) {
	const gl = renderer.gl;
	renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
	renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
	renderer.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
	renderer.terrainLayerCapacity = terrainLayerCapacity(gl);
	renderer.floatTexture = Boolean(gl.getExtension('OES_texture_float'));
	renderer.maxUniformJoints = Math.max(
		8,
		Math.min(96, Math.floor((renderer.maxVertexUniformVectors - 32) / 4))
	);
	renderer.jointMode = renderer.maxUniformJoints >= 72
		? 'uniform'
		: renderer.maxVertexTextures > 0 && renderer.floatTexture
			? 'texture'
			: 'uniform';
	const vertexShader = renderer.jointMode === 'texture'
		? unifiedTextureVertexShader
		: unifiedUniformVertexShader(renderer.maxUniformJoints);
	const fragmentShader = fragmentShaderForLayerCount(renderer.terrainLayerCapacity);
	const program = createProgram(
		gl,
		vertexShader,
		fragmentShader,
		`unified-${renderer.jointMode}-${renderer.terrainLayerCapacity}-layers`,
		renderer.errors
	);
	const sharedLocations = rendererLocations(
		gl,
		program,
		renderer.terrainLayerCapacity
	);
	sharedLocations.useSkin = gl.getUniformLocation(program, 'uUseSkin');
	renderer.programs = { rigid: program, skin: program };
	renderer.loc = { rigid: sharedLocations, skin: sharedLocations };
	renderer.skinTexture = gl.createTexture();
}
