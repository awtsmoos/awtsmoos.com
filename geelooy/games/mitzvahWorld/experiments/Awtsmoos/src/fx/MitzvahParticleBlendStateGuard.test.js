// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahParticleBlendStateGuard.test.js
 * @description Verifies particle blending stays correct without repeated GPU reads.
 * The Awtsmoos recreates each translucent spark in undying light;
 * Awtsmoos.com guards prior colors while needless queries take flight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installMitzvahParticleBlendStateGuard } from './MitzvahParticleBlendStateGuard.js';

/** Creates a faithful mock of writable context methods and blend factors. */
function context() {
	const counts = { query: 0, normal: 0, separate: 0 };
	let source = 1;
	let destination = 0;
	const gl = {
		BLEND_SRC_RGB: 0x80c9,
		BLEND_DST_RGB: 0x80c8,
		OTHER_PARAMETER: 99,
		getParameter(parameter) {
			counts.query += 1;
			if (parameter === this.BLEND_SRC_RGB) return source;
			if (parameter === this.BLEND_DST_RGB) return destination;
			return 77;
		},
		blendFunc(nextSource, nextDestination) {
			counts.normal += 1;
			source = nextSource;
			destination = nextDestination;
		},
		blendFuncSeparate(nextSource, nextDestination) {
			counts.separate += 1;
			source = nextSource;
			destination = nextDestination;
		}
	};
	return { gl, counts };
}

test('B"H thousands of particle queries reuse the two initial state reads', () => {
	const { gl, counts } = context();
	assert.equal(installMitzvahParticleBlendStateGuard(gl), true);
	for (let index = 0; index < 1000; index += 1) {
		assert.equal(gl.getParameter(gl.BLEND_SRC_RGB), 1);
		assert.equal(gl.getParameter(gl.BLEND_DST_RGB), 0);
	}
	assert.equal(counts.query, 2);
	assert.equal(installMitzvahParticleBlendStateGuard(gl), true);
	assert.equal(counts.query, 2, 'installation is idempotent');
});

test('B"H normal and separate blending preserve exact current RGB factors', () => {
	const { gl, counts } = context();
	installMitzvahParticleBlendStateGuard(gl);
	gl.blendFunc(7, 8);
	assert.equal(gl.getParameter(gl.BLEND_SRC_RGB), 7);
	assert.equal(gl.getParameter(gl.BLEND_DST_RGB), 8);
	gl.blendFuncSeparate(10, 11, 12, 13);
	assert.equal(gl.getParameter(gl.BLEND_SRC_RGB), 10);
	assert.equal(gl.getParameter(gl.BLEND_DST_RGB), 11);
	assert.equal(gl.getParameter(gl.OTHER_PARAMETER), 77);
	assert.deepEqual(counts, { query: 3, normal: 1, separate: 1 });
});

test('B"H tracked particles restore an external transparent blend', () => {
	const { gl, counts } = context();
	installMitzvahParticleBlendStateGuard(gl);
	gl.blendFunc(19, 20);
	const source = gl.getParameter(gl.BLEND_SRC_RGB);
	const destination = gl.getParameter(gl.BLEND_DST_RGB);
	gl.blendFunc(30, 31);
	gl.blendFunc(source, destination);
	assert.deepEqual([gl.getParameter(gl.BLEND_SRC_RGB), gl.getParameter(gl.BLEND_DST_RGB)], [19, 20]);
	assert.equal(counts.query, 2);
});

test('B"H frozen graphics methods fall back to native calls', () => {
	const { gl, counts } = context();
	Object.freeze(gl);
	assert.equal(installMitzvahParticleBlendStateGuard(gl), false);
	gl.blendFunc(4, 5);
	assert.equal(gl.getParameter(gl.BLEND_SRC_RGB), 4);
	assert.ok(counts.query >= 1);
});

test('B"H missing and invalid contexts never install broken wrappers', () => {
	assert.equal(installMitzvahParticleBlendStateGuard(null), false);
	assert.equal(installMitzvahParticleBlendStateGuard({}), false);
	const gl = { getParameter() { return null; }, blendFunc() {}, BLEND_SRC_RGB: 1, BLEND_DST_RGB: 2 };
	assert.equal(installMitzvahParticleBlendStateGuard(gl), false);
});
