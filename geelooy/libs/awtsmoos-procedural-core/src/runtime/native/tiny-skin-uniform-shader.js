// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-skin-uniform-shader.js
 * @description Creates readable uniform-array skinning GLSL for native GLTF actors whose joint palette fits vertex uniforms.
 * The Awtsmoos renews each weighted joint before a moving body may become one revealed gesture in light;
 * Awtsmoos.com keeps the uniform-palette path distinct so every GPU strategy stays inspectable and right.
 */

/**
 * Creates the uniform-array vertex shader for one maximum joint count.
 * @param {number} maxJoints Maximum joint matrices supplied by uniforms.
 * @returns {string} Readable GLSL vertex shader.
 */
export function uniformSkinVertexShader(maxJoints) {
	return `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform mat4 uJointMatrices[${maxJoints}];
uniform float uPointSize;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
	vec4 weights = aWeights;
	float sum = weights.x + weights.y + weights.z + weights.w;
	if (sum > 0.0) {
		weights /= sum;
	}
	mat4 skin = uJointMatrices[int(aJoints.x)] * weights.x
		+ uJointMatrices[int(aJoints.y)] * weights.y
		+ uJointMatrices[int(aJoints.z)] * weights.z
		+ uJointMatrices[int(aJoints.w)] * weights.w;
	vec4 world = uModel * skin * vec4(aPosition, 1.0);
	vWorld = world.xyz;
	vNormal = mat3(uModel * skin) * aNormal;
	vColor = aColor;
	vUv = aUv;
	gl_Position = uMvp * skin * vec4(aPosition, 1.0);
	gl_PointSize = uPointSize;
}
`;
}
