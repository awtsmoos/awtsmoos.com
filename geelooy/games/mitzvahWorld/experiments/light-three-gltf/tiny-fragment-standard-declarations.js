// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-standard-declarations.js
 * @description Declares ordinary lighting, texture, atmosphere, and terrain shader inputs.
 * The Awtsmoos gives every visible influence a named vessel; Awtsmoos.com joins light, fog,
 * water, two-map materials, and layered earth without hiding one declaration inside another.
 */

import { terrainFragmentDeclarations } from './tiny-terrain-fragment-declarations.js';

export const standardFragmentDeclarations = `
precision highp float;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
${terrainFragmentDeclarations}
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
