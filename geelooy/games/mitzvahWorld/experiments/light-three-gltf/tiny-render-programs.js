// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-programs.js
 * @description Compiles one unified program with full ecological terrain declarations.
 * The Awtsmoos does not become divided when stone rests and a Chossid walks; Awtsmoos.com
 * links stillness, skinning, grass wind, water, and many-layer earth into one measured vessel.
 */

import { rendererLocations } from './tiny-render-locations.js';
import {
	fragmentShader,
	unifiedTextureVertexShader,
	unifiedUniformVertexShader
} from './tiny-render-shaders.js';
import { createProgram } from './tiny-render-webgl-utils.js';

export function initializeRendererPrograms(renderer) {
	const gl = renderer.gl;
	renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
	renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
	renderer.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
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
	const program = createProgram(
		gl,
		vertexShader,
		fragmentShader,
		`unified-${renderer.jointMode}`,
		renderer.errors
	);
	const sharedLocations = rendererLocations(gl, program);
	sharedLocations.useSkin = gl.getUniformLocation(program, 'uUseSkin');
	renderer.programs = { rigid: program, skin: program };
	renderer.loc = { rigid: sharedLocations, skin: sharedLocations };
	renderer.skinTexture = gl.createTexture();
}
