// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gl-state-decision.test.mjs
 * @description Pins the reusable decision vessel: one object is refilled per
 * call, skip verdicts match witnessed state, and commit settles exactly the
 * state the historic allocating decisions settled.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	commitGlStateDecision,
	createGlStateDecision,
	createGlStateModel,
	decideGlStateCall
} from '../tiny-gl-state-model.js';

const gl = { ARRAY_BUFFER: 34962 };

test('B"H one vessel serves every verdict and commit settles state', () => {
	const state = createGlStateModel();
	const vessel = createGlStateDecision();
	const program = {};
	const first = decideGlStateCall(vessel, 'useProgram', [program], state, gl);
	assert.equal(first, vessel);
	assert.equal(vessel.skip, false);
	commitGlStateDecision(vessel);
	assert.equal(state.program.known, true);
	assert.equal(state.program.value, program);
	const second = decideGlStateCall(vessel, 'useProgram', [program], state, gl);
	assert.equal(second, vessel);
	assert.equal(vessel.skip, true);
	const other = {};
	decideGlStateCall(vessel, 'useProgram', [other], state, gl);
	assert.equal(vessel.skip, false);
	commitGlStateDecision(vessel);
	assert.equal(state.program.value, other);
});

test('B"H pointer verdicts track the bound array buffer exactly', () => {
	const state = createGlStateModel();
	const vessel = createGlStateDecision();
	const buffer = {};
	decideGlStateCall(vessel, 'bindBuffer', [gl.ARRAY_BUFFER, buffer], state, gl);
	assert.equal(vessel.skip, false);
	commitGlStateDecision(vessel);
	decideGlStateCall(vessel, 'vertexAttribPointer', [0, 3, 5126, false, 0, 0], state, gl);
	assert.equal(vessel.skip, false);
	commitGlStateDecision(vessel);
	decideGlStateCall(vessel, 'vertexAttribPointer', [0, 3, 5126, false, 0, 0], state, gl);
	assert.equal(vessel.skip, true);
	decideGlStateCall(vessel, 'vertexAttribPointer', [0, 3, 5126, false, 16, 0], state, gl);
	assert.equal(vessel.skip, false);
});

test('B"H bindTexture before any activeTexture always executes', () => {
	const state = createGlStateModel();
	const vessel = createGlStateDecision();
	decideGlStateCall(vessel, 'bindTexture', [3553, {}], state, gl);
	assert.equal(vessel.skip, false);
	assert.equal(vessel.kind, 'none');
	commitGlStateDecision(vessel);
	assert.equal(state.textures.size, 0);
});
