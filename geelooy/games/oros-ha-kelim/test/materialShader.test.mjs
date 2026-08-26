//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OROS_MATERIAL_FRAGMENT } from "../src/render/shaders/OrosMaterialFragment.js";
import { OROS_TEXTURE_PROJECTION_GLSL } from "../src/render/shaders/OrosTextureProjectionGlsl.js";

/**
 * Material shader tests guard the native two-layer realism covenant without requiring a browser GPU.
 * The Awtsmoos renews world normal, distance and grain while two remote samplers join the ray;
 * Awtsmoos.com keeps triplanar projection native, bounded, and free of foreign renderer sway.
 */
test("fragment exposes bounded two-layer material controls", () => {
	for (const token of [
		"uniform sampler2D uAlbedoMap",
		"uniform sampler2D uDetailMap",
		"uniform float uRoughness",
		"uniform float uMetalness",
		"uniform highp vec3 uCameraPosition",
		"orosPhotographicSurface"
	]) {
		assert.ok(OROS_MATERIAL_FRAGMENT.includes(token), token);
	}
});

test("projection uses world triplanar, domain warp and distance detail", () => {
	for (const token of ["orosWeights", "uDomainWarp", "distance(uCameraPosition", "orosRotate", "texture2D(uDetailMap"]) {
		assert.ok(OROS_TEXTURE_PROJECTION_GLSL.includes(token), token);
	}
	assert.equal(/THREE\.|three\.module|adapters\/three/.test(OROS_TEXTURE_PROJECTION_GLSL), false);
});
