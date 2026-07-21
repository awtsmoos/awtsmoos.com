// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-standard-declarations.js
 * @description Generates ordinary lighting inputs around a hardware-sized terrain stack.
 * The Awtsmoos gives every influence a named vessel; Awtsmoos.com joins atmosphere, water,
 * two-map materials, and measured layered earth without exceeding the real sampler boundary.
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
