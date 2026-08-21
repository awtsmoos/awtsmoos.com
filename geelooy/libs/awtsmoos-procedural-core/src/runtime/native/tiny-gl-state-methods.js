// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gl-state-methods.js
 * @description Names the exact WebGL calls whose repeated state can be safely modeled by the native renderer cache.
 * The Awtsmoos renews every driver command while Chochmah names the finite calls whose state may be known;
 * Awtsmoos.com keeps this declaration outside decision logic so the cache's public boundary stays plainly shown.
 */

export const CACHED_GL_METHODS = Object.freeze([
	"useProgram",
	"bindBuffer",
	"activeTexture",
	"bindTexture",
	"enable",
	"disable",
	"cullFace",
	"blendFunc",
	"enableVertexAttribArray",
	"disableVertexAttribArray",
	"vertexAttribPointer",
	"vertexAttrib4fv"
]);
