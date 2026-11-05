// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindFieldDynamics.test.mjs
 * @description Proves one coherent advected weather law serves meadow and live nature without transient targets.
 * The Awtsmoos sends one breath through neighboring places while every vessel keeps its own task;
 * Awtsmoos.com proves deterministic fronts, compatibility, cadence, finite quaternions, and traveler wake.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleMinimalMeadowEnvironmentalWind } from '../../app/MinimalMeadowEnvironmentalWind.js';
import { sampleEnvironmentalWind } from '../environment/EnvironmentalWindField.js';
import { SharedWindField } from './SharedWindField.js';

test('B"H environmental wind is deterministic, advected, coherent, and target-reusing', () => {
	const input = { baseStrength: 0.08, time: 4.2, x: 12, z: -7 };
	const first = {};
	const second = {};
	assert.equal(sampleEnvironmentalWind(first, input), first);
	sampleEnvironmentalWind(second, input);
	assert.deepEqual(second, first);
	const later = sampleEnvironmentalWind({}, { ...input, time: 5.2 });
	assert.notEqual(later.front, first.front);
	const neighbor = sampleEnvironmentalWind({}, { ...input, x: 12.5, z: -6.7 });
	const alignment = first.directionX * neighbor.directionX + first.directionZ * neighbor.directionZ;
	assert.ok(alignment > 0.95);
	for (const value of Object.values(first)) assert.equal(Number.isFinite(value), true);
});

test('meadow compatibility adapter exposes exactly the canonical field', () => {
	const input = {
		baseStrength: 0.05,
		interactionRadius: 8,
		playerX: 1,
		playerZ: 2,
		time: 3,
		wakeX: 2,
		wakeZ: 1,
		x: 2,
		z: 2.5
	};
	assert.deepEqual(
		sampleMinimalMeadowEnvironmentalWind({}, input),
		sampleEnvironmentalWind({}, input)
	);
});

test('live nature wind respects cadence and publishes traveler wake evidence', () => {
	const origin = { x: 0, z: 0 };
	const quaternion = testQuaternion();
	const instance = {
		placement: {
			asset: { windAmplitude: 0.16 },
			x: 2.5,
			yaw: 0.35,
			z: 1.5
		},
		scene: { quaternion }
	};
	const field = new SharedWindField({
		framesPerSecond: 10,
		visibilityOrigin: () => origin
	});
	assert.equal(field.update(0, [instance]), true);
	const firstRotation = [...quaternion.values];
	assert.equal(field.update(0.05, [instance]), false);
	origin.x = 2;
	origin.z = 1;
	assert.equal(field.update(0.2, [instance]), true);
	const evidence = field.snapshot();
	assert.equal(evidence.mode, 'advected-real-model-quaternion-sway');
	assert.equal(evidence.updates, 2);
	assert.ok(evidence.wake > 0);
	assert.notDeepEqual(quaternion.values, firstRotation);
	for (const value of quaternion.values) assert.equal(Number.isFinite(value), true);
});

function testQuaternion() {
	return {
		values: [0, 0, 0, 1],
		set(x, y, z, w) {
			this.values = [x, y, z, w];
			return this;
		}
	};
}
