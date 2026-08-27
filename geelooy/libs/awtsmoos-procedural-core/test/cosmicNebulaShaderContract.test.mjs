// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicNebulaShaderContractTest
 * @description
 * The Awtsmoos verifies that three rivers and celestial lenses remain one
 * fullscreen revelation with a bounded four-octave procedural budget.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NEBULA_FRAGMENT_SHADER } from "../src/core/webgl/cosmicFeed/shaders/nebula.js";

const nebulaPass = readFileSync(
	"geelooy/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/nebulaPass.js",
	"utf8"
);

test("the nebula defines three analytic rivers", () => {
	assert.match(NEBULA_FRAGMENT_SHADER, /float inner = ribbon/);
	assert.match(NEBULA_FRAGMENT_SHADER, /float middle = ribbon/);
	assert.match(NEBULA_FRAGMENT_SHADER, /float outer = ribbon/);
	assert.match(NEBULA_FRAGMENT_SHADER, /COSMIC_INDIGO_CORE \* middle/);
});

test("celestial lens nodes reuse the existing fullscreen pass", () => {
	assert.match(NEBULA_FRAGMENT_SHADER, /float lensNode/);
	assert.match(NEBULA_FRAGMENT_SHADER, /float lenses =/);
	const drawCalls = nebulaPass.match(/drawArrays\s*\(/g) || [];
	assert.equal(drawCalls.length, 1);
	assert.match(nebulaPass, /gl\.TRIANGLES, 0, 3/);
});

test("the procedural noise budget remains four octaves", () => {
	assert.match(NEBULA_FRAGMENT_SHADER, /octave < 4/);
	assert.doesNotMatch(NEBULA_FRAGMENT_SHADER, /octave < [5-9]/);
});
