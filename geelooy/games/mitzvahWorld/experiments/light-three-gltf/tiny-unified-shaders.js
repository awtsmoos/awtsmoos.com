//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tiny-unified-shaders.js
 * @description Carries rigid, skinned, rooted vegetation, and ecological zone data through one measured GPU program.
 * The Awtsmoos is not divided by stillness, motion, moisture, or terrain meaning; Awtsmoos.com keeps
 * Chassidim, cottages, living grass, and many-layer earth inside one linked shader vessel without duplicate programs.
 */

import {
	vegetationVertexDeclarations,
	vegetationVertexFunctions
} from './tiny-vegetation-vertex-deformation.js';
import { INSTANCE_MATRIX_ATTRIBUTES } from './tiny-instancing.js';

const declarations = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aZone;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;
uniform int uUseSkin;
${vegetationVertexDeclarations}
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
varying vec4 vZone;
`;

const instancedDeclarations = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aZone;
attribute vec4 ${INSTANCE_MATRIX_ATTRIBUTES[0]};
attribute vec4 ${INSTANCE_MATRIX_ATTRIBUTES[1]};
attribute vec4 ${INSTANCE_MATRIX_ATTRIBUTES[2]};
attribute vec4 ${INSTANCE_MATRIX_ATTRIBUTES[3]};
uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;
uniform int uUseSkin;
${vegetationVertexDeclarations}
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
varying vec4 vZone;
`;

function unifiedMainFunction({ instanced = false } = {}) {
	if (instanced) {
		return `
${vegetationVertexFunctions}
void main(){
	mat4 instanceMatrix=mat4(${INSTANCE_MATRIX_ATTRIBUTES[0]},${INSTANCE_MATRIX_ATTRIBUTES[1]},${INSTANCE_MATRIX_ATTRIBUTES[2]},${INSTANCE_MATRIX_ATTRIBUTES[3]});
	vec3 localPosition=aPosition;
	vec4 baseWorld=instanceMatrix*vec4(aPosition,1.0);
	float heightFactor=clamp(aUv.y,0.0,1.0);
	localPosition=applyVegetationMotion(localPosition,baseWorld,heightFactor);
	vec4 local=vec4(localPosition,1.0);
	vec4 world=uModel*instanceMatrix*local;
	vWorld=world.xyz;
	vNormal=mat3(uModel*instanceMatrix)*aNormal;
	vColor=aColor;
	vUv=aUv;
	vZone=aZone;
	gl_Position=uMvp*local;
	gl_PointSize=uPointSize;
}
`;
	}
	return `
${vegetationVertexFunctions}
void main(){
	mat4 skin=mat4(1.0);
	if(uUseSkin==1){
		vec4 weights=aWeights;
		float sum=weights.x+weights.y+weights.z+weights.w;
		if(sum>0.0)weights/=sum;
		skin=jointAt(aJoints.x)*weights.x
			+jointAt(aJoints.y)*weights.y
			+jointAt(aJoints.z)*weights.z
			+jointAt(aJoints.w)*weights.w;
	}
	vec3 localPosition=aPosition;
	vec4 baseWorld=uModel*vec4(aPosition,1.0);
	float heightFactor=clamp(aUv.y,0.0,1.0);
	if(uUseSkin==0){
		localPosition=applyVegetationMotion(localPosition,baseWorld,heightFactor);
	}
	vec4 local=skin*vec4(localPosition,1.0);
	vec4 world=uModel*local;
	vWorld=world.xyz;
	vNormal=mat3(uModel*skin)*aNormal;
	vColor=aColor;
	vUv=aUv;
	vZone=aZone;
	gl_Position=uMvp*local;
	gl_PointSize=uPointSize;
}
`;
}

const mainFunction = unifiedMainFunction();

export function unifiedUniformVertexShader(maxJoints) {
	return `${declarations}
uniform mat4 uJointMatrices[${maxJoints}];
mat4 jointAt(float joint){
	return uJointMatrices[int(joint)];
}
${mainFunction}`;
}

export const unifiedTextureVertexShader = `${declarations}
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
}
${mainFunction}`;

/**
 * Instanced rigid vertex shader: one tuft/prop geometry drawn thousands of times.
 * Instanced meshes never skin; the per-instance matrix carries each placement,
 * and vegetation wind deformation reads the instance world position as its root.
 */
export function unifiedInstancedVertexShader() {
	return `${instancedDeclarations}
${unifiedMainFunction({ instanced: true })}`;
}
