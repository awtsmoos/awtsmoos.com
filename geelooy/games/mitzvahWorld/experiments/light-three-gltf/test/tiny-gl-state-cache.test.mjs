// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gl-state-cache.test.mjs
 * @description Proves exact skips, selective VAO invalidation, restore, and identity.
 * The Awtsmoos remembers without confusion; Awtsmoos.com erases only the declarations
 * a hidden vertex-array change can alter while preserving every unrelated witnessed state.
 */

import assert from 'node:assert/strict';
import { installGlStateCache } from '../tiny-gl-state-cache.js';
import {
	createFakeGl,
	nativeCallCount
} from './tiny-gl-state-cache-fixture.mjs';

const { gl, calls } = createFakeGl();
const originalUseProgram = gl.useProgram;
const originalOtherMethod = gl.otherMethod;
const cache = installGlStateCache(gl);

assert.equal(installGlStateCache(gl), cache);
assert.equal(gl.otherMethod, originalOtherMethod);
const program = {};
gl.useProgram(program);
gl.useProgram(program);
assert.equal(nativeCallCount(calls, 'useProgram'), 1);

const firstBuffer = {};
const secondBuffer = {};
gl.bindBuffer(gl.ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ARRAY_BUFFER, secondBuffer);
assert.equal(nativeCallCount(calls, 'bindBuffer'), 3);

gl.activeTexture(gl.TEXTURE0);
gl.activeTexture(gl.TEXTURE0);
const texture = {};
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture);
assert.equal(nativeCallCount(calls, 'activeTexture'), 2);
assert.equal(nativeCallCount(calls, 'bindTexture'), 2);

gl.enable(gl.CULL_FACE);
gl.enable(gl.CULL_FACE);
gl.disable(gl.CULL_FACE);
gl.disable(gl.CULL_FACE);
assert.equal(nativeCallCount(calls, 'enable'), 1);
assert.equal(nativeCallCount(calls, 'disable'), 1);

gl.cullFace(gl.BACK);
gl.cullFace(gl.BACK);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
assert.equal(nativeCallCount(calls, 'cullFace'), 1);
assert.equal(nativeCallCount(calls, 'blendFunc'), 1);

gl.enableVertexAttribArray(0);
gl.enableVertexAttribArray(0);
gl.disableVertexAttribArray(0);
gl.disableVertexAttribArray(0);
assert.equal(nativeCallCount(calls, 'enableVertexAttribArray'), 1);
assert.equal(nativeCallCount(calls, 'disableVertexAttribArray'), 1);

gl.bindBuffer(gl.ARRAY_BUFFER, firstBuffer);
gl.vertexAttribPointer(0, 3, 5126, false, 0, 0);
gl.vertexAttribPointer(0, 3, 5126, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, secondBuffer);
gl.vertexAttribPointer(0, 3, 5126, false, 0, 0);
assert.equal(nativeCallCount(calls, 'vertexAttribPointer'), 2);

gl.vertexAttrib4fv(2, [0, 0, 0, 1]);
gl.vertexAttrib4fv(2, [0, 0, 0, 1]);
gl.vertexAttrib4fv(2, [1, 0, 0, 1]);
assert.equal(nativeCallCount(calls, 'vertexAttrib4fv'), 2);

const programCalls = nativeCallCount(calls, 'useProgram');
const bufferCalls = nativeCallCount(calls, 'bindBuffer');
const pointerCalls = nativeCallCount(calls, 'vertexAttribPointer');
cache.invalidateVertexArrayState();
gl.useProgram(program);
gl.bindBuffer(gl.ARRAY_BUFFER, secondBuffer);
gl.vertexAttribPointer(0, 3, 5126, false, 0, 0);
assert.equal(nativeCallCount(calls, 'useProgram'), programCalls);
assert.equal(nativeCallCount(calls, 'bindBuffer'), bufferCalls + 1);
assert.equal(nativeCallCount(calls, 'vertexAttribPointer'), pointerCalls + 1);
assert.equal(cache.stats.vertexArrayInvalidations, 1);

cache.invalidate();
gl.useProgram(program);
assert.equal(nativeCallCount(calls, 'useProgram'), programCalls + 1);
assert.equal(cache.stats.invalidations, 1);
assert.ok(cache.stats.methods.useProgram.skips >= 1);

cache.restore();
assert.equal(gl.useProgram, originalUseProgram);
assert.notEqual(installGlStateCache(gl), cache);
console.log(JSON.stringify({
	ok: true,
	invalidations: cache.stats.invalidations,
	vertexArrayInvalidations: cache.stats.vertexArrayInvalidations
}, null, 2));
