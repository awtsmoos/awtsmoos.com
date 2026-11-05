// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-shadow-map.test.mjs
 * @description Proves the budgeted shadow map: tier table, resource lifecycle,
 * unit reservation below the sampler limit, and the world-to-light matrix law.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	computeShadowMatrix,
	createShadowMapState,
	destroyShadowResources,
	ensureShadowResources,
	isShadowTier,
	shadowTextureUnit,
	shadowTierResolution,
	SHADOW_FRUSTUM_RADIUS,
	SHADOW_TIER_IDS,
	SHADOW_TIER_RESOLUTIONS
} from '../tiny-shadow-map.js';

test('B"H shadow tiers budget 2048/1024/512 texels, off disables', () => {
	assert.deepEqual({ ...SHADOW_TIER_RESOLUTIONS }, {
		near: 2048,
		mid: 1024,
		far: 512,
		off: 0
	});
	assert.deepEqual([...SHADOW_TIER_IDS].sort(), ['far', 'mid', 'near', 'off']);
	assert.equal(isShadowTier('near'), true);
	assert.equal(isShadowTier('mid'), true);
	assert.equal(isShadowTier('bogus'), false);
	assert.equal(shadowTierResolution('near'), 2048);
	assert.equal(shadowTierResolution('off'), 0);
	assert.equal(shadowTierResolution('bogus'), 0);
});

test('B"H shadow state starts enabled at the near tier', () => {
	const state = createShadowMapState();
	assert.equal(state.enabled, true);
	assert.equal(state.tier, 'near');
	assert.equal(state.size, 2048);
	assert.equal(state.dirty, true);
	assert.equal(state.framebuffer, null);
	assert.equal(state.texture, null);
});

test('B"H shadow resources allocate a packed RGBA target with depth', () => {
	const calls = [];
	const gl = recordingGl(calls);
	const state = createShadowMapState();
	assert.equal(ensureShadowResources(gl, state), true);
	assert.equal(state.dirty, false);
	assert.ok(state.texture);
	assert.ok(state.framebuffer);
	assert.equal(state.texelSize, 1 / 2048);
	const texImage = calls.find(call => call[0] === 'texImage2D');
	assert.deepEqual(texImage.slice(4, 7), [2048, 2048, 0]);
	const renderbuffer = calls.find(call => call[0] === 'renderbufferStorage');
	assert.ok(renderbuffer, 'depth renderbuffer is attached');
	// Second call reuses without reallocating.
	const count = calls.length;
	assert.equal(ensureShadowResources(gl, state), true);
	assert.equal(calls.length, count);
	destroyShadowResources(gl, state);
	assert.equal(state.texture, null);
	assert.equal(state.framebuffer, null);
});

test('B"H disabled shadows allocate nothing', () => {
	const calls = [];
	const gl = recordingGl(calls);
	const state = createShadowMapState();
	state.enabled = false;
	state.size = 0;
	assert.equal(ensureShadowResources(gl, state), false);
	assert.equal(calls.length, 0);
});

test('B"H shadow texture unit sits after terrain layers inside the limit', () => {
	const gl = { MAX_TEXTURE_IMAGE_UNITS: 35533, getParameter: () => 16 };
	assert.equal(shadowTextureUnit(gl, 6), 9);
	assert.equal(shadowTextureUnit(gl, 4), 7);
	const poorGl = { MAX_TEXTURE_IMAGE_UNITS: 35533, getParameter: () => 8 };
	assert.equal(shadowTextureUnit(poorGl, 4), 7);
});

test('B"H shadow matrix maps the sun direction into light clip space', () => {
	const sun = [-0.42, 0.76, 0.49];
	const center = { x: 10, y: 2, z: -7 };
	const matrix = computeShadowMatrix(sun, center, SHADOW_FRUSTUM_RADIUS, new Float32Array(16));
	// The focus center must land at the middle of light clip space.
	const clip = transformPoint(matrix, [center.x, center.y, center.z]);
	assert.ok(Math.abs(clip[0]) < 0.001, `center x ${clip[0]}`);
	assert.ok(Math.abs(clip[1]) < 0.001, `center y ${clip[1]}`);
	assert.ok(clip[2] > -1 && clip[2] < 1, `center z ${clip[2]}`);
	// A point toward the sun must come closer (smaller depth) than one away.
	const toward = transformPoint(matrix, [
		center.x + sun[0] * 10,
		center.y + sun[1] * 10,
		center.z + sun[2] * 10
	]);
	const away = transformPoint(matrix, [
		center.x - sun[0] * 10,
		center.y - sun[1] * 10,
		center.z - sun[2] * 10
	]);
	assert.ok(toward[2] < away[2], 'sunward point is nearer in light depth');
	// Straight-down sun must not degenerate (up-vector guard).
	const down = computeShadowMatrix([0, -1, 0], center, 60, new Float32Array(16));
	assert.ok(down.every(Number.isFinite), 'no NaN for vertical sun');
});

function transformPoint(matrix, point) {
	const x = point[0];
	const y = point[1];
	const z = point[2];
	const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
	return [
		(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
		(matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
		(matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
	];
}

function recordingGl(calls) {
	const ids = { count: 0 };
	const id = prefix => `${prefix}-${++ids.count}`;
	return {
		RGBA: 6408,
		UNSIGNED_BYTE: 5121,
		TEXTURE_2D: 3553,
		TEXTURE_MIN_FILTER: 10241,
		TEXTURE_MAG_FILTER: 10240,
		TEXTURE_WRAP_S: 10242,
		TEXTURE_WRAP_T: 10243,
		LINEAR: 9729,
		CLAMP_TO_EDGE: 33071,
		FRAMEBUFFER: 36160,
		COLOR_ATTACHMENT0: 36064,
		DEPTH_ATTACHMENT: 36096,
		RENDERBUFFER: 36161,
		DEPTH_COMPONENT16: 33189,
		CLAMP_TO_EDGE: 33071,
		createTexture: () => id('texture'),
		createFramebuffer: () => id('framebuffer'),
		createRenderbuffer: () => id('renderbuffer'),
		deleteTexture: texture => calls.push(['deleteTexture', texture]),
		deleteFramebuffer: framebuffer => calls.push(['deleteFramebuffer', framebuffer]),
		deleteRenderbuffer: buffer => calls.push(['deleteRenderbuffer', buffer]),
		bindTexture: (...args) => calls.push(['bindTexture', ...args]),
		texParameteri: (...args) => calls.push(['texParameteri', ...args]),
		texImage2D: (...args) => calls.push(['texImage2D', ...args]),
		bindFramebuffer: (...args) => calls.push(['bindFramebuffer', ...args]),
		framebufferTexture2D: (...args) => calls.push(['framebufferTexture2D', ...args]),
		bindRenderbuffer: (...args) => calls.push(['bindRenderbuffer', ...args]),
		renderbufferStorage: (...args) => calls.push(['renderbufferStorage', ...args]),
		framebufferRenderbuffer: (...args) => calls.push(['framebufferRenderbuffer', ...args])
	};
}
