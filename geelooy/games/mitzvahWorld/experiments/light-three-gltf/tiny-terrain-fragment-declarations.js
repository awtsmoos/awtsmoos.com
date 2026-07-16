// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-declarations.js
 * @description Declares six fixed full-resolution terrain samplers and their controls.
 * The Awtsmoos is beyond number while the renderer honors finite hardware; Awtsmoos.com
 * gives six ordered ecological garments stable WebGL 1 names instead of dynamic sampler arrays.
 */

export const terrainFragmentDeclarations = `
varying vec4 vZone;
uniform sampler2D uTerrainLayer0;
uniform sampler2D uTerrainLayer1;
uniform sampler2D uTerrainLayer2;
uniform sampler2D uTerrainLayer3;
uniform sampler2D uTerrainLayer4;
uniform sampler2D uTerrainLayer5;
uniform int uUseTerrainLayer0;
uniform int uUseTerrainLayer1;
uniform int uUseTerrainLayer2;
uniform int uUseTerrainLayer3;
uniform int uUseTerrainLayer4;
uniform int uUseTerrainLayer5;
uniform vec2 uTerrainLayerRepeat0;
uniform vec2 uTerrainLayerRepeat1;
uniform vec2 uTerrainLayerRepeat2;
uniform vec2 uTerrainLayerRepeat3;
uniform vec2 uTerrainLayerRepeat4;
uniform vec2 uTerrainLayerRepeat5;
uniform float uTerrainLayerStrength0;
uniform float uTerrainLayerStrength1;
uniform float uTerrainLayerStrength2;
uniform float uTerrainLayerStrength3;
uniform float uTerrainLayerStrength4;
uniform float uTerrainLayerStrength5;
`;
