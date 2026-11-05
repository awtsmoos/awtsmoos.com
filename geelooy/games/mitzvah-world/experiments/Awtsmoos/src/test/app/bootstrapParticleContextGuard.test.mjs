// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bootstrapParticleContextGuard.test.mjs
 * @description Ensures live gameplay frames install the blend cache after renderer creation.
 * The Awtsmoos illumines each fragment, even when the first renderer comes late;
 * Awtsmoos.com keeps the Chossid walking, his particles flowing through the gate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	guardBootstrapParticleContext,
	renderBootstrapGameplay
} from '../../app/BootstrapFrameExecution.js';

/** Creates the minimal real WebGL blend contract, without constructing a GPU. */
function fakeWebGl() {
	const calls = [];
	let source = 1;
	let destination = 0;
	const gl = {
		BLEND_SRC_RGB: 32969,
		BLEND_DST_RGB: 32968,
		getParameter(parameter) {
			calls.push(parameter);
			return parameter === gl.BLEND_SRC_RGB ? source : destination;
		},
		blendFunc(nextSource, nextDestination) {
			source = nextSource;
			destination = nextDestination;
		},
		canvas: { addEventListener() {} }
	};
	return { gl, calls };
}

/** Particles are not allowed to trigger state probes on every frame. */
test('bootstrap frame installs cached blend values before particle update', () => {
	const { gl, calls } = fakeWebGl();
	const frames = [];
	const runtime = {
		renderer: {
			gl,
			setInteractor() {},
			render() { frames.push('render'); }
		},
		mitzvahParticleLayer: {
			update() {
				assert.equal(gl.getParameter(gl.BLEND_SRC_RGB), 1);
				assert.equal(gl.getParameter(gl.BLEND_DST_RGB), 0);
				frames.push('particles');
			}
		}
	};
	renderBootstrapGameplay(runtime, 1000);
	renderBootstrapGameplay(runtime, 1100);
	assert.deepEqual(frames, ['render', 'particles', 'render', 'particles']);
	assert.equal(calls.length, 2);
	assert.equal(Object.hasOwn(gl, 'getParameter'), true);
});

/** A newly hydrated context must receive its own correct cached values. */
test('new renderer contexts are guarded without recreating particle layers', () => {
	const first = fakeWebGl();
	const second = fakeWebGl();
	const runtime = {
		renderer: { gl: first.gl },
		mitzvahParticleLayer: { update() {} }
	};
	assert.equal(guardBootstrapParticleContext(runtime), true);
	runtime.renderer.gl = second.gl;
	assert.equal(guardBootstrapParticleContext(runtime), true);
	assert.equal(first.calls.length, 2);
	assert.equal(second.calls.length, 2);
});

/** Unsupported contexts must never keep the Chossid from walking. */
test('optional particles and unavailable contexts fail safely', () => {
	assert.equal(guardBootstrapParticleContext({ renderer: { gl: {} } }), false);
	assert.equal(guardBootstrapParticleContext({
		renderer: { gl: null },
		mitzvahParticleLayer: { update() {} }
	}), false);
	assert.equal(guardBootstrapParticleContext({
		renderer: { gl: {} },
		mitzvahParticleLayer: { update() {} }
	}), false);
});
