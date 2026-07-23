// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-standard-declarations.js
 * @description Generates lighting inputs around terrain and one physical water program.
 * The Awtsmoos gives every influence a named vessel; Awtsmoos.com joins four-flow water,
 * atmosphere, two-map materials, and measured earth without exceeding sampler boundaries.
 */

import {
	terrainDeclarationsForLayerCount,
	terrainFragmentDeclarations
} from './tiny-terrain-fragment-declarations.js';

export const standardFragmentDeclarations = standardDeclarations(
	terrainFragmentDeclarations
);

export function standardDeclarationsForLayerCount(layerCount) {
	return standardDeclarations(terrainDeclarationsForLayerCount(layerCount));
}

function standardDeclarations(terrainDeclarations) {
	return `
precision highp float;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
${terrainDeclarations}
uniform vec4 uColor;
uniform float uAlphaCutoff;
uniform int uAlphaMode;
uniform int uLit;
uniform int uUseMap;
uniform sampler2D uMap;
uniform vec2 uMapRepeat;
uniform int uUseMixMap;
uniform sampler2D uMixMap;
uniform vec2 uMixRepeat;
uniform float uMixStrength;
uniform float uMixPatchScale;
uniform float uMixPatchSharpness;
uniform int uMaterialMode;
uniform int uWaterMode;
uniform vec2 uWaterFlowA;
uniform vec2 uWaterFlowB;
uniform vec2 uWaterFlowC;
uniform vec2 uWaterFlowD;
uniform vec3 uWaterDeepColor;
uniform vec3 uWaterShallowColor;
uniform vec4 uWaterWaveProfile;
uniform vec4 uWaterFoamProfile;
uniform vec3 uWaterReflectionProfile;
uniform float uEmissiveStrength;
uniform float uTime;
uniform vec3 uAmbient;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uExposure;
`;
}
