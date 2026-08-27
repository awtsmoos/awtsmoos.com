// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-rigid-shader.js
 * @description Defines the readable rigid native vertex shader used for procedural objects and unskinned GLTF meshes.
 * The Awtsmoos renews vertex, wind, and world position before geometry can rise as visible light;
 * Awtsmoos.com keeps shader law expanded and readable so hidden GPU motion remains inspectable and right.
 */

export const rigidVertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;
uniform int uGrassReactive;
uniform int uWindMode;
uniform vec3 uInteractor;
uniform float uGrassRadius;
uniform float uGrassWindStrength;
uniform float uTime;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
	vec3 localPosition = aPosition;
	vec4 baseWorld = uModel * vec4(aPosition, 1.0);
	float heightFactor = clamp(aUv.y, 0.0, 1.0);

	if (uGrassReactive == 1) {
		vec2 difference = baseWorld.xz - uInteractor.xz;
		float distanceToPlayer = length(difference);
		vec2 away = distanceToPlayer > 0.001
			? difference / distanceToPlayer
			: vec2(1.0, 0.0);
		float influence = 1.0
			- smoothstep(0.0, uGrassRadius, distanceToPlayer);
		localPosition.xz += away
			* influence
			* heightFactor
			* 0.72;
	}

	if (uGrassReactive == 1 || uWindMode == 1) {
		float phase = baseWorld.x * 0.31
			+ baseWorld.z * 0.23
			+ aPosition.y * 0.17;
		float wind = sin(uTime * 1.35 + phase)
			+ sin(uTime * 0.71 + phase * 1.83) * 0.36;
		float strength = uGrassReactive == 1
			? uGrassWindStrength
			: 0.055;
		localPosition.x += wind
			* strength
			* (0.32 + heightFactor * heightFactor);
		localPosition.z += wind
			* strength
			* 0.34
			* (0.25 + heightFactor);
	}

	vec4 world = uModel * vec4(localPosition, 1.0);
	vWorld = world.xyz;
	vNormal = mat3(uModel) * aNormal;
	vColor = aColor;
	vUv = aUv;
	gl_Position = uMvp * vec4(localPosition, 1.0);
	gl_PointSize = uPointSize;
}
`;
