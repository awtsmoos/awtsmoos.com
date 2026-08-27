// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleShaderContractTest
 * @description
 * The Awtsmoos verifies that extreme particle form remains one efficient field.
 * Awtsmoos.com moves repeated streak rotation out of fragment work while keeping
 * one canonical draw call and exact flare geometry.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	PARTICLE_FRAGMENT_SHADER,
	PARTICLE_VERTEX_SHADER
} from "../src/core/webgl/cosmicFeed/shaders/particles.js";

const particleField = readFileSync(
	"geelooy/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/particleField.js",
	"utf8"
);

test("fragment streak rotation uses a vertex-supplied direction", () => {
	assert.match(PARTICLE_VERTEX_SHADER, /out vec2 vDirection/);
	assert.match(
		PARTICLE_VERTEX_SHADER,
		/vDirection = flow \/ max\(length\(flow\), 0\.001\)/
	);
	assert.match(PARTICLE_FRAGMENT_SHADER, /in vec2 vDirection/);
	assert.match(PARTICLE_FRAGMENT_SHADER, /mat2\(vDirection\.x/);
	assert.doesNotMatch(PARTICLE_FRAGMENT_SHADER, /\b(?:sin|cos)\s*\(/);
});

test("flare geometry avoids fragment exponential work", () => {
	assert.match(PARTICLE_FRAGMENT_SHADER, /smoothstep\(0\.1, 0\.0/);
	assert.match(PARTICLE_FRAGMENT_SHADER, /float cross =/);
	assert.doesNotMatch(PARTICLE_FRAGMENT_SHADER, /\bexp\s*\(/);
});

test("the complete particle field remains one draw call", () => {
	const drawCalls = particleField.match(/drawArrays\s*\(/g) || [];
	assert.equal(drawCalls.length, 1);
	assert.match(particleField, /gl\.POINTS/);
});
