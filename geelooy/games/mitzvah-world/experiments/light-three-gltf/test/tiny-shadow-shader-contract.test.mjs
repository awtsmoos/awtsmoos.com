// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-shadow-shader-contract.test.mjs
 * @description Locks the shadow GLSL contract: fragment uniforms, the PCF
 * lookup inside the lighting path, and depth-only shaders that pack depth
 * into RGBA without any depth-texture extension.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	depthFragmentShader,
	depthVertexShader
} from '../tiny-depth-shaders.js';
import { fragmentShadowFunctions } from '../tiny-fragment-shadow-functions.js';
import { fragmentLightingFunctions } from '../tiny-fragment-lighting-functions.js';
import { standardDeclarationsForLayerCount } from '../tiny-fragment-standard-declarations.js';

test('B"H fragment declarations carry the shadow uniforms', () => {
	const declarations = standardDeclarationsForLayerCount(6);
	assert.match(declarations, /uniform sampler2D uShadowMap;/);
	assert.match(declarations, /uniform mat4 uShadowMatrix;/);
	assert.match(declarations, /uniform float uShadowStrength;/);
	assert.match(declarations, /uniform vec2 uShadowTexel;/);
});

test('B"H PCF shadow lookup is defined and dims only direct sun', () => {
	assert.match(fragmentShadowFunctions, /float shadowOcclusion\(vec3 worldPosition,vec3 normal\)/);
	assert.match(fragmentShadowFunctions, /uShadowMatrix\*vec4\(worldPosition,1\.0\)/);
	assert.match(fragmentShadowFunctions, /texture2D\(uShadowMap/);
	// Outside the frustum or with zero strength the world stays fully lit.
	assert.match(fragmentShadowFunctions, /return 1\.0;/);
	assert.match(fragmentShadowFunctions, /uShadowStrength<=0\.001/);
	// litSurface applies the occlusion to direct sunlight and specular.
	assert.match(fragmentLightingFunctions, /float shadow=shadowOcclusion\(vWorld,normal\);/);
	assert.match(fragmentLightingFunctions, /uSunColor\*\(direct\*0\.96\+wrapped\*0\.18\)\*shadow/);
	assert.match(fragmentLightingFunctions, /specular\*=shadow;/);
});

test('B"H depth shaders pack depth into RGBA with no extensions', () => {
	assert.match(depthFragmentShader, /packShadowDepth\(gl_FragCoord\.z\)/);
	assert.doesNotMatch(depthFragmentShader, /DEPTH_COMPONENT/);
	const rigid = depthVertexShader(32, { skinned: false, instanced: false });
	assert.match(rigid, /uniform mat4 uDepthMvp;/);
	assert.match(rigid, /gl_Position=uDepthMvp\*world;/);
	assert.doesNotMatch(rigid, /aJoints/);
	const skinned = depthVertexShader(32, { skinned: true, jointMode: 'uniform' });
	assert.match(skinned, /uniform mat4 uJointMatrices\[32\];/);
	assert.match(skinned, /uUseSkin==1/);
	const skinnedTexture = depthVertexShader(32, { skinned: true, jointMode: 'texture' });
	assert.match(skinnedTexture, /uniform sampler2D uJointTexture;/);
	const instanced = depthVertexShader(32, { instanced: true });
	assert.match(instanced, /attribute vec4 aInstanceMatrix0;/);
	assert.match(instanced, /instanceMatrix\*local/);
});
