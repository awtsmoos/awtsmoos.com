// B"H
// Boruch Hashem
// Blessed is He

/** @file WaterShaderRecipe.js @description Flowing Fresnel water with procedural normals and foam. */
import { waterFirebaseMaterialRecipe } from './FirebaseMaterialRecipe.js';

const VERTEX_SHADER = `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float waveAmplitude;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vWave;
void main() {
	float phaseX = position.x * 0.45 + time;
	float phaseZ = position.z * 0.37 - time * 0.8;
	float waveX = sin(phaseX) * waveAmplitude;
	float waveZ = cos(phaseZ) * waveAmplitude * 0.6;
	vec3 displaced = position;
	displaced.y += waveX + waveZ;
	vec3 waveNormal = normalize(vec3(
		-cos(phaseX) * 0.45 * waveAmplitude,
		1.0,
		sin(phaseZ) * 0.37 * waveAmplitude * 0.6
	));
	vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
	vNormal = normalize(normal + waveNormal - vec3(0.0, 1.0, 0.0));
	vViewPosition = -viewPosition.xyz;
	vUv = uv;
	vWave = (waveX + waveZ) / max(waveAmplitude * 1.6, 0.0001);
	gl_Position = projectionMatrix * viewPosition;
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D albedoMap;
uniform vec3 deepColor;
uniform vec3 shallowColor;
uniform float opacity;
uniform float time;
uniform vec2 flowDirection;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vWave;
void main() {
	vec2 flowUv = vUv + flowDirection * time * 0.035;
	float phaseA = (flowUv.x + flowUv.y) * 34.0 + time * 1.7;
	float phaseB = (flowUv.x * 0.72 - flowUv.y) * 47.0 - time * 1.25;
	float cosineA = cos(phaseA);
	float sineB = sin(phaseB);
	float slopeX = cosineA * 0.62 - sineB * 0.274;
	float slopeY = cosineA * 0.62 + sineB * 0.38;
	vec3 proceduralDetail = normalize(vec3(-slopeX * 0.42, 1.0, -slopeY * 0.42));
	vec3 normalVector = normalize(vNormal + vec3(proceduralDetail.x, 0.0, proceduralDetail.z) * 0.5);
	float fresnel = pow(1.0 - max(dot(normalize(vViewPosition), normalVector), 0.0), 3.0);
	vec3 albedoA = texture2D(albedoMap, flowUv * 0.6).rgb;
	vec3 albedoB = texture2D(albedoMap, flowUv * 0.44 + vec2(0.31, 0.17)).rgb;
	vec3 albedo = mix(albedoA, albedoB, 0.34);
	float microCrest = cosineA * 0.62 + sineB * 0.38;
	float crest = smoothstep(0.48, 0.94, vWave * 0.62 + microCrest * 0.22 + 0.32);
	float foam = crest * (0.22 + fresnel * 0.2);
	vec3 water = mix(shallowColor * albedo, deepColor, 0.43 + fresnel * 0.42);
	water = mix(water, vec3(0.92), foam);
	gl_FragColor = vec4(water, opacity);
}`;

export function createWaterShaderRecipe(options = {}) {
	return {
		fragmentShader: FRAGMENT_SHADER,
		material: waterFirebaseMaterialRecipe(),
		channelPolicy: {
			albedoMap: 'public-color-photograph-two-flow-samples',
			normal: 'procedural-two-trig-wave-gradient-no-photo-map',
			foam: 'procedural-wave-crest-no-photo-map'
		},
		transparent: true,
		uniforms: {
			deepColor: options.deepColor || [0.015, 0.16, 0.24],
			flowDirection: options.flowDirection || [0.7, 0.25],
			opacity: number(options.opacity, 0.86),
			shallowColor: options.shallowColor || [0.12, 0.52, 0.58],
			time: 0,
			waveAmplitude: number(options.waveAmplitude, 0.055)
		},
		vertexShader: VERTEX_SHADER
	};
}

function number(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
