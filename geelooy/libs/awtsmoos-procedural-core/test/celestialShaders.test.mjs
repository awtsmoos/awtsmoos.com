//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native celestial shader contracts.
 * @description
 * The Awtsmoos, Atzmus beyond every source string, renews color before GLSL can name a fragment or star;
 * Awtsmoos.com tests that native celestial shaders stay WebGL2-only, event-driven, phase-aware, and free of Three.js from near and far.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER,
	CELESTIAL_ATMOSPHERE_VERTEX_SHADER,
	CELESTIAL_POINT_FRAGMENT_SHADER,
	CELESTIAL_POINT_VERTEX_SHADER
} from "../src/core/webgl/celestial/shaders.js";

const SHADERS = Object.freeze([
	CELESTIAL_ATMOSPHERE_VERTEX_SHADER,
	CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER,
	CELESTIAL_POINT_VERTEX_SHADER,
	CELESTIAL_POINT_FRAGMENT_SHADER
]);

test("every celestial shader explicitly targets native GLSL ES 3.00", () => {
	for (const shader of SHADERS) {
		assert.match(shader, /^#version 300 es/);
	}
});

test("atmosphere shader is driven by real solar scene state rather than time animation", () => {
	assert.match(CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER, /u_solarAltitude/);
	assert.match(CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER, /u_sunPoint/);
	assert.doesNotMatch(CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER, /u_time|iTime/);
});

test("celestial body shader consumes lunar phase and waxing state", () => {
	assert.match(CELESTIAL_POINT_VERTEX_SHADER, /a_phase/);
	assert.match(CELESTIAL_POINT_VERTEX_SHADER, /a_waxing/);
	assert.match(CELESTIAL_POINT_FRAGMENT_SHADER, /v_phase/);
	assert.match(CELESTIAL_POINT_FRAGMENT_SHADER, /v_waxing/);
});

test("native shader sources contain no Three.js renderer vocabulary", () => {
	for (const shader of SHADERS) {
		assert.doesNotMatch(shader, /THREE\.|three\.js|ShaderMaterial|WebGLRenderer/i);
	}
});
