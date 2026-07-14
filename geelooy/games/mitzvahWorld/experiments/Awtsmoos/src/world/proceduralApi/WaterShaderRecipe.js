// B"H
// Boruch Hashem
// Blessed is He

/** @file WaterShaderRecipe.js @description Flowing Fresnel water shader contract for rivers and wells. */
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
void main() {
	vec3 displaced = position;
	displaced.y += sin(position.x * 0.45 + time) * waveAmplitude;
	displaced.y += cos(position.z * 0.37 - time * 0.8) * waveAmplitude * 0.6;
	vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
	vNormal = normalize(normal);
	vViewPosition = -viewPosition.xyz;
	vUv = uv;
	gl_Position = projectionMatrix * viewPosition;
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D foamMap;
uniform vec3 deepColor;
uniform vec3 shallowColor;
uniform float opacity;
uniform float time;
uniform vec2 flowDirection;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
void main() {
	vec2 flowUv = vUv + flowDirection * time * 0.035;
	vec3 detail = texture2D(normalMap, flowUv).rgb * 2.0 - 1.0;
	vec3 normalVector = normalize(vNormal + detail * 0.35);
	float fresnel = pow(1.0 - max(dot(normalize(vViewPosition), normalVector), 0.0), 3.0);
	vec3 albedo = texture2D(albedoMap, flowUv * 0.6).rgb;
	float foam = texture2D(foamMap, flowUv * 1.8).r;
	vec3 water = mix(shallowColor * albedo, deepColor, 0.45 + fresnel * 0.4);
	water = mix(water, vec3(0.92), smoothstep(0.82, 1.0, foam) * 0.16);
	gl_FragColor = vec4(water, opacity);
}`;

export function createWaterShaderRecipe(options = {}) {
	return {
		fragmentShader: FRAGMENT_SHADER,
		material: waterFirebaseMaterialRecipe(),
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
