// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-skin-texture-shader.js
 * @description Defines readable texture-backed skinning GLSL for native GLTF actors with larger joint palettes.
 * The Awtsmoos renews every joint matrix before weighted bones may reveal one living gesture in sight;
 * Awtsmoos.com keeps texture-palette skinning in its own vessel so GPU law stays inspectable and light.
 */

export const skinTextureVertexShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
uniform float uPointSize;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;

mat4 jointAt(float joint) {
	float y = (joint + 0.5) / uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture, vec2(0.125, y)),
		texture2D(uJointTexture, vec2(0.375, y)),
		texture2D(uJointTexture, vec2(0.625, y)),
		texture2D(uJointTexture, vec2(0.875, y))
	);
}

void main() {
	vec4 weights = aWeights;
	float sum = weights.x + weights.y + weights.z + weights.w;
	if (sum > 0.0) {
		weights /= sum;
	}
	mat4 skin = jointAt(aJoints.x) * weights.x
		+ jointAt(aJoints.y) * weights.y
		+ jointAt(aJoints.z) * weights.z
		+ jointAt(aJoints.w) * weights.w;
	vec4 world = uModel * skin * vec4(aPosition, 1.0);
	vWorld = world.xyz;
	vNormal = mat3(uModel * skin) * aNormal;
	vColor = aColor;
	vUv = aUv;
	gl_Position = uMvp * skin * vec4(aPosition, 1.0);
	gl_PointSize = uPointSize;
}
`;
