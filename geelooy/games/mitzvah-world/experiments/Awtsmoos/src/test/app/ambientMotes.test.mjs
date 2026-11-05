// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ambientMotes.test.mjs
 * @description Proves subtle atmosphere obeys strict budgets, reduced motion, deterministic drift, and exact teardown.
 * The Awtsmoos needs only a few points of light to reveal depth in the air;
 * Awtsmoos.com proves those points remain bounded, move without multiplication, and disappear cleanly when the world is no longer there.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowAmbientMotes } from '../../app/MinimalMeadowAmbientMotes.js';
import { ambientMoteQualityProfile } from '../../app/MinimalMeadowAmbientMoteQuality.js';
import { ambientMoteSpec } from '../../app/MinimalMeadowAmbientMoteLayout.js';

test('ambient quality remains low-count and disables itself for reduced motion', () => {
	assert.equal(ambientMoteQualityProfile(environment('high')).count, 12);
	assert.equal(ambientMoteQualityProfile(environment('medium')).count, 9);
	assert.equal(ambientMoteQualityProfile(environment('low')).count, 5);
	assert.equal(ambientMoteQualityProfile(environment('minimal')).count, 0);
	assert.equal(ambientMoteQualityProfile(environment('high', true)).count, 0);
});

test('ambient mote identity is deterministic and varied', () => {
	assert.deepEqual(ambientMoteSpec(3, 9), ambientMoteSpec(3, 9));
	assert.notDeepEqual(ambientMoteSpec(3, 9), ambientMoteSpec(4, 9));
	assert.ok(ambientMoteSpec(3, 9).scale < 0.06);
});

test('ambient system creates bounded meshes, drifts, reports, and detaches exactly once', () => {
	const runtime = runtimeFixture();
	const motes = new MinimalMeadowAmbientMotes(runtime, environment('low'));
	assert.equal(motes.diagnostics().count, 5);
	assert.equal(motes.diagnostics().drawCalls, 5);
	assert.equal(runtime.scene.children.includes(motes.group), true);
	const before = motes.motes[0].mesh.position.y;
	motes.update(1);
	assert.notEqual(motes.motes[0].mesh.position.y, before);
	motes.destroy();
	assert.equal(motes.diagnostics().active, false);
	assert.equal(runtime.scene.children.includes(motes.group), false);
	motes.destroy();
	assert.equal(motes.motes.length, 0);
});

test('reduced motion creates no scene payload', () => {
	const runtime = runtimeFixture();
	const motes = new MinimalMeadowAmbientMotes(runtime, environment('high', true));
	assert.equal(motes.diagnostics().count, 0);
	assert.equal(runtime.scene.children.includes(motes.group), false);
	motes.destroy();
});

function runtimeFixture() {
	return {
		camera: { position: { x: 2, y: 3, z: -4 } },
		scene: new Group(),
		state: { x: 0, y: 0, z: 0 }
	};
}

function environment(quality, reducedMotion = false) {
	return {
		__AWTSMOOS_EFFECT_QUALITY__: quality,
		matchMedia() {
			return { matches: reducedMotion };
		}
	};
}
