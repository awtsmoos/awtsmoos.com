// B"H
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

assert.equal(installGlStateCache(gl), cache, 'installation should be idempotent');
assert.equal(gl.otherMethod, originalOtherMethod, 'unlisted WebGL methods stay untouched');

const program = {};
gl.useProgram(program);
gl.useProgram(program);
assert.equal(nativeCallCount(calls, 'useProgram'), 1, 'repeated program should skip');

const firstBuffer = {};
const secondBuffer = {};
gl.bindBuffer(gl.ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, firstBuffer);
gl.bindBuffer(gl.ARRAY_BUFFER, secondBuffer);
assert.equal(nativeCallCount(calls, 'bindBuffer'), 3, 'buffer targets and identities remain distinct');

gl.activeTexture(gl.TEXTURE0);
gl.activeTexture(gl.TEXTURE0);
const texture = {};
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture);
assert.equal(nativeCallCount(calls, 'activeTexture'), 2, 'texture units should skip exact repeats');
assert.equal(nativeCallCount(calls, 'bindTexture'), 2, 'texture bindings remain unit-specific');

gl.enable(gl.CULL_FACE);
gl.enable(gl.CULL_FACE);
gl.disable(gl.CULL_FACE);
gl.disable(gl.CULL_FACE);
assert.equal(nativeCallCount(calls, 'enable'), 1, 'capability enable should skip exact repeats');
assert.equal(nativeCallCount(calls, 'disable'), 1, 'capability disable should skip exact repeats');

gl.cullFace(gl.BACK);
gl.cullFace(gl.BACK);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
assert.equal(nativeCallCount(calls, 'cullFace'), 1, 'cull mode should reuse exact state');
assert.equal(nativeCallCount(calls, 'blendFunc'), 1, 'blend function should reuse exact state');

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
assert.equal(nativeCallCount(calls, 'vertexAttribPointer'), 2, 'pointer state includes the bound buffer');

gl.vertexAttrib4fv(2, [0, 0, 0, 1]);
gl.vertexAttrib4fv(2, [0, 0, 0, 1]);
gl.vertexAttrib4fv(2, [1, 0, 0, 1]);
assert.equal(nativeCallCount(calls, 'vertexAttrib4fv'), 2, 'constant attributes compare exact values');

cache.invalidate();
gl.useProgram(program);
assert.equal(nativeCallCount(calls, 'useProgram'), 2, 'invalidation should execute the next exact call');
assert.equal(cache.stats.invalidations, 1);
assert.ok(cache.stats.methods.useProgram.skips >= 1, 'skip statistics should be exposed');

cache.restore();
assert.equal(gl.useProgram, originalUseProgram, 'restore should recover the native method');
assert.notEqual(installGlStateCache(gl), cache, 'restored contexts may install a fresh cache');

console.log(JSON.stringify({
	ok: true,
	invalidations: cache.stats.invalidations,
	programStats: cache.stats.methods.useProgram,
	bufferStats: cache.stats.methods.bindBuffer,
	textureStats: cache.stats.methods.bindTexture
}, null, 2));
