// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-depth-shaders.js
 * @description Minimal depth-only shaders for the sun shadow pre-pass.
 * The Awtsmoos weighs every vessel before clothing it in light; Awtsmoos.com
 * renders casters into a packed RGBA depth texture with the smallest honest
 * vertex program: rigid, skinned, and instanced variants, no lighting, no color.
 * Skinned depth mirrors the main program's joint mode (uniform palette or
 * joint texture) so characters cast truthful shadows on every GPU.
 */

import { INSTANCE_MATRIX_ATTRIBUTES } from './tiny-instancing.js';

export const depthFragmentShader = `
precision highp float;
vec4 packShadowDepth(float depth){
	vec4 bitShift=vec4(1.0,255.0,65025.0,16581375.0);
	vec4 bitMask=vec4(0.00392156862745098,0.00392156862745098,0.00392156862745098,0.0);
	vec4 rgba=fract(depth*bitShift);
	rgba-=rgba.yzww*bitMask;
	return rgba;
}
void main(){
	gl_FragColor=packShadowDepth(gl_FragCoord.z);
}
`;

function jointLookupGLSL(jointMode, maxJoints) {
	if (jointMode === 'texture') {
		return `
precision highp float;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
mat4 jointAt(float joint){
	float y=(joint+0.5)/uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture,vec2(0.125,y)),
		texture2D(uJointTexture,vec2(0.375,y)),
		texture2D(uJointTexture,vec2(0.625,y)),
		texture2D(uJointTexture,vec2(0.875,y))
	);
}`;
	}
	return `
uniform mat4 uJointMatrices[${Math.max(1, maxJoints | 0)}];
mat4 jointAt(float joint){return uJointMatrices[int(joint)];}`;
}

/**
 * Builds the depth vertex shader.
 * uDepthMvp is the per-draw baked matrix (shadowMatrix * model), so the shader
 * needs no model uniform of its own.
 */
export function depthVertexShader(
	maxJoints,
	{ skinned = false, instanced = false, jointMode = 'uniform' } = {}
) {
	const attributes = ['attribute vec3 aPosition;'];
	if (skinned) {
		attributes.push('attribute vec4 aJoints;', 'attribute vec4 aWeights;');
	}
	if (instanced) {
		for (const name of INSTANCE_MATRIX_ATTRIBUTES) {
			attributes.push(`attribute vec4 ${name};`);
		}
	}
	const instanceMatrix = instanced
		? `mat4 instanceMatrix=mat4(${INSTANCE_MATRIX_ATTRIBUTES.join(',')});`
		: '';
	const skinApply = skinned
		? `if(uUseSkin==1){
		vec4 normalized=aWeights;
		float sum=aWeights.x+aWeights.y+aWeights.z+aWeights.w;
		if(sum>0.0)normalized/=sum;
		mat4 skin=jointAt(aJoints.x)*normalized.x
			+jointAt(aJoints.y)*normalized.y
			+jointAt(aJoints.z)*normalized.z
			+jointAt(aJoints.w)*normalized.w;
		local=skin*local;
	}`
		: '';
	return `
${attributes.join('\n')}
uniform mat4 uDepthMvp;
${skinned ? 'uniform int uUseSkin;' : ''}
${skinned ? jointLookupGLSL(jointMode, maxJoints) : ''}
void main(){
	${instanceMatrix}
	vec4 local=vec4(aPosition,1.0);
	${skinApply}
	${instanced ? 'vec4 world=instanceMatrix*local;' : 'vec4 world=local;'}
	gl_Position=uDepthMvp*world;
}
`;
}
