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
	depthFragmentShader,
	depthVertexShader
} from './tiny-depth-shaders.js';
import {
	fragmentShaderForLayerCount,
	unifiedInstancedVertexShader,
	unifiedTextureVertexShader,
	unifiedUniformVertexShader
} from './tiny-render-shaders.js';
import { INSTANCE_MATRIX_ATTRIBUTES } from './tiny-instancing.js';
import {
	shadowTextureUnit,
	SHADOW_TIER_RESOLUTIONS
} from './tiny-shadow-map.js';
import { terrainLayerCapacity } from './tiny-terrain-layer-policy.js';
import { createProgram } from './tiny-render-webgl-utils.js';

export function initializeRendererPrograms(renderer) {
	const gl = renderer.gl;
	renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
	renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
	renderer.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
	// The sun shadow map reserves one fragment sampler; terrain layers shrink
	// only on sampler-poor GPUs (8 units: 6 -> 4 layers, 16 units: unchanged 6).
	renderer.shadowsReserved = renderer.shadow?.size > 0;
	renderer.terrainLayerCapacity = terrainLayerCapacity(gl, {
		shadowSampler: renderer.shadowsReserved
	});
	renderer.shadowUnit = shadowTextureUnit(gl, renderer.terrainLayerCapacity);
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
	if (renderer.instancing?.supported) {
		const instancedProgram = createProgram(
			gl,
			unifiedInstancedVertexShader(),
			fragmentShader,
			`unified-instanced-${renderer.terrainLayerCapacity}-layers`,
			renderer.errors
		);
		const instancedLocations = rendererLocations(
			gl,
			instancedProgram,
			renderer.terrainLayerCapacity
		);
		instancedLocations.useSkin = gl.getUniformLocation(instancedProgram, 'uUseSkin');
		renderer.programs.instanced = instancedProgram;
		renderer.loc.instanced = instancedLocations;
	}
	initializeDepthPrograms(renderer);
	renderer.skinTexture = gl.createTexture();
}

/** Compiles the three tiny depth-only programs behind the shadow pre-pass. */
function initializeDepthPrograms(renderer) {
	const gl = renderer.gl;
	const maxJoints = renderer.maxUniformJoints;
	const variants = {
		depthRigid: { skinned: false, instanced: false },
		depthSkinned: { skinned: true, instanced: false },
		depthInstanced: { skinned: false, instanced: true }
	};
	for (const [name, flags] of Object.entries(variants)) {
		if (name === 'depthInstanced' && !renderer.instancing?.supported) continue;
		const program = createProgram(
			gl,
			depthVertexShader(maxJoints, { ...flags, jointMode: renderer.jointMode }),
			depthFragmentShader,
			`shadow-depth-${name}`,
			renderer.errors
		);
		renderer.programs[name] = program;
		renderer.loc[name] = depthLocations(gl, program);
	}
}

function depthLocations(gl, program) {
	const attribute = name => gl.getAttribLocation(program, name);
	const uniform = name => gl.getUniformLocation(program, name);
	return {
		depthMvp: uniform('uDepthMvp'),
		instanceMatrix: INSTANCE_MATRIX_ATTRIBUTES.map(attribute),
		jointMatrices: uniform('uJointMatrices[0]'),
		jointTexture: uniform('uJointTexture'),
		jointTextureHeight: uniform('uJointTextureHeight'),
		joints: attribute('aJoints'),
		position: attribute('aPosition'),
		useSkin: uniform('uUseSkin'),
		weights: attribute('aWeights')
	};
}
