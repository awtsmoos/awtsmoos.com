// B"H
import {
	fragmentShader,
	rigidVertexShader,
	skinTextureVertexShader,
	uniformSkinVertexShader
} from './tiny-render-shaders.js';
import {
	createProgram,
	locations
} from './tiny-render-webgl-utils.js';

/** Compiles rigid and skin programs and records the hardware joint strategy. */
export function initializeRendererPrograms(renderer) {
	const gl = renderer.gl;
	renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
	renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
	renderer.floatTexture = !!gl.getExtension('OES_texture_float');
	renderer.maxUniformJoints = Math.max(
		8,
		Math.min(96, Math.floor((renderer.maxVertexUniformVectors - 32) / 4))
	);
	renderer.jointMode = renderer.maxUniformJoints >= 72
		? 'uniform'
		: renderer.maxVertexTextures > 0 && renderer.floatTexture
			? 'texture'
			: 'uniform';
	renderer.programs = {
		rigid: createProgram(gl, rigidVertexShader, fragmentShader, 'rigid', renderer.errors)
	};
	const skinVertex = renderer.jointMode === 'texture'
		? skinTextureVertexShader
		: uniformSkinVertexShader(renderer.maxUniformJoints);
	renderer.programs.skin = createProgram(
		gl,
		skinVertex,
		fragmentShader,
		`skin-${renderer.jointMode}`,
		renderer.errors
	);
	renderer.loc = {
		rigid: locations(gl, renderer.programs.rigid),
		skin: locations(gl, renderer.programs.skin)
	};
	renderer.skinTexture = gl.createTexture();
}
