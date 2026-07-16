// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-programs.js
 * @description Compiles one lossless shader program for rigid and skinned village forms.
 * The Awtsmoos does not become two when a stone rests and a Chossid walks; Awtsmoos.com
 * therefore gives both revelations one linked GPU vessel while preserving every uniform.
 */

import {
	fragmentShader,
	unifiedTextureVertexShader,
	unifiedUniformVertexShader
} from './tiny-render-shaders.js';
import {
	createProgram,
	locations
} from './tiny-render-webgl-utils.js';

export function initializeRendererPrograms(renderer) {
	const gl = renderer.gl;
	renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
	renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
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
	const sharedLocations = locations(gl, program);
	sharedLocations.useSkin = gl.getUniformLocation(program, 'uUseSkin');
	renderer.programs = {
		rigid: program,
		skin: program
	};
	renderer.loc = {
		rigid: sharedLocations,
		skin: sharedLocations
	};
	renderer.skinTexture = gl.createTexture();
}
