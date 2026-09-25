// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-program-state.test.mjs
 * @description Proves shared-context program reclamation, texture invalidation, and empty debug-pass truthfulness.
 * The Awtsmoos is one beyond every shader garment; Awtsmoos.com therefore reclaims the living program
 * after any foreign pass instead of mistaking remembered renderer intent for the current WebGL state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { reclaimRenderProgram } from '../tiny-render-program-state.js';
import { drawSkeleton } from '../tiny-render-skeleton.js';
import { MaterialTextureBinder } from '../tiny-render-textures.js';
import { Scene } from '../tiny-runtime.js';

test('world program is reclaimed after a foreign pass clears shared GL state', () => {
	const worldProgram = { name: 'world' };
	const foreignProgram = { name: 'particles' };
	const calls = [];
	let currentProgram = worldProgram;
	const renderer = programRenderer(worldProgram, calls, program => {
		currentProgram = program;
	});

	renderer.gl.useProgram(foreignProgram);
	renderer.gl.useProgram(null);
	assert.equal(renderer.activeProgram, worldProgram);
	assert.equal(currentProgram, null);

	reclaimRenderProgram(renderer, 'rigid');
	assert.equal(currentProgram, worldProgram);
	assert.equal(calls.at(-1), worldProgram);
	assert.equal(renderer.stats.programSwitches, 0);
});

test('logical world-program changes still invalidate program-local caches', () => {
	const worldProgram = { name: 'world' };
	const renderer = programRenderer(worldProgram, [], () => {});
	renderer.activeProgram = null;
	reclaimRenderProgram(renderer, 'rigid');
	assert.equal(renderer.activeProgram, worldProgram);
	assert.equal(renderer.stats.programSwitches, 1);
	assert.equal(renderer.materialState.previous, null);
	assert.equal(renderer.textureInvalidations, 1);
});

test('texture state invalidation re-uploads identical state for a different program', () => {
	const gl = textureGl();
	const binder = new MaterialTextureBinder(gl);
	const stats = {};
	const locations = textureLocations();
	binder.bind(locations, {}, stats);
	binder.bind(locations, {}, stats);
	assert.equal(stats.textureStateUploads, 1);
	assert.equal(stats.textureStateSkips, 1);
	binder.invalidate();
	binder.bind(locations, {}, stats);
	assert.equal(stats.textureStateUploads, 2);
	assert.ok(gl.uniformCalls.length > 0);
});

test('an empty skeleton pass reports no shader switch', () => {
	const renderer = {
		gl: { useProgram() { throw new Error('empty skeletons must not switch programs'); } }
	};
	assert.equal(drawSkeleton(renderer, new Scene(), new Float32Array(16)), false);
});

function programRenderer(worldProgram, calls, commit) {
	const renderer = {
		activeProgram: worldProgram,
		loc: { rigid: { name: 'world-locations' } },
		materialState: { previous: { name: 'material' } },
		programs: { rigid: worldProgram },
		stats: { programSwitches: 0 },
		textureInvalidations: 0
	};
	renderer.gl = {
		useProgram(program) {
			calls.push(program);
			commit(program);
		}
	};
	renderer.textures = {
		invalidate() { renderer.textureInvalidations += 1; }
	};
	return renderer;
}

function textureLocations() {
	return {
		map: 'map', mapRepeat: 'mapRepeat', mixMap: 'mixMap', mixRepeat: 'mixRepeat',
		mixStrength: 'mixStrength', terrainLayers: [], useMap: 'useMap', useMixMap: 'useMixMap'
	};
}

function textureGl() {
	let textureId = 0;
	return {
		CLAMP_TO_EDGE: 33071, MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
		MAX_TEXTURE_IMAGE_UNITS: 34930, NEAREST: 9728, RGBA: 6408, TEXTURE0: 33984,
		TEXTURE_2D: 3553, TEXTURE_MAG_FILTER: 10240, TEXTURE_MIN_FILTER: 10241,
		TEXTURE_WRAP_S: 10242, TEXTURE_WRAP_T: 10243, UNSIGNED_BYTE: 5121,
		uniformCalls: [], activeTexture() {}, bindTexture() {}, getExtension() { return null; },
		createTexture() { textureId += 1; return { textureId }; }, getParameter() { return 16; },
		texImage2D() {}, texParameteri() {}, uniform1f(...args) { this.uniformCalls.push(args); },
		uniform1i(...args) { this.uniformCalls.push(args); }, uniform2f(...args) { this.uniformCalls.push(args); }
	};
}
