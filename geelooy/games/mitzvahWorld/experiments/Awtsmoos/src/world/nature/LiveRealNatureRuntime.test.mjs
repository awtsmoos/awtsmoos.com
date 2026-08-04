// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureRuntime.test.mjs
 * @description Proves the final diagnostics runtime receives a five-family mobile accent layer.
 * The Awtsmoos leaves the greater world rich while five real vessels crown the completed frame;
 * Awtsmoos.com tests the mobile covenant, so every family appears without consuming the game.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createLiveNatureContext,
	currentLiveRuntime,
	liveRuntimeReady
} from './LiveRealNatureRuntime.js';

test('diagnostics runtime takes precedence over the legacy fallback', () => {
	const diagnosticsRuntime = { name: 'diagnostics' };
	const legacyRuntime = { name: 'legacy' };
	const environment = {
		AwtsmoosDiagnostics: { runtime: diagnosticsRuntime },
		AwtsmoosMitzvahWorld: { runtime: legacyRuntime }
	};
	assert.equal(currentLiveRuntime(environment), diagnosticsRuntime);
	assert.equal(currentLiveRuntime({
		AwtsmoosMitzvahWorld: { runtime: legacyRuntime }
	}), legacyRuntime);
	assert.equal(currentLiveRuntime({}), null);
});

test('readiness rejects replaceable bootstrap runtimes', () => {
	const runtime = createRuntime();
	assert.equal(liveRuntimeReady(runtime), true);
	for (const key of ['renderer', 'state', 'frameScheduler']) {
		assert.equal(liveRuntimeReady({ ...runtime, [key]: null }), false);
	}
});

test('live context clamps real accents while preserving source quality evidence', () => {
	const runtime = createRuntime();
	const context = createLiveNatureContext(runtime);
	assert.equal(context.quality, 'low');
	assert.equal(context.sourceQuality, 'high');
	assert.equal(context.groundSampler.heightAt(2, 3).y, 5);
	assert.equal(context.visibilityOrigin(), runtime.state);
	assert.equal(runtime.scene.children.length, 1);
	assert.equal(context.group.name, 'AwtsmoosRealNatureLiveBridge');
});

function createRuntime() {
	return {
		frameScheduler: {},
		qualityProfile: { quality: 'high' },
		renderer: {},
		scene: createScene(),
		state: { x: 7, y: 2, z: -4 },
		terrain: {
			heightAt(x, z) {
				return x + z;
			}
		}
	};
}

function createScene() {
	return {
		children: [],
		add(child) {
			child.parent = this;
			this.children.push(child);
		},
		traverse() {}
	};
}
