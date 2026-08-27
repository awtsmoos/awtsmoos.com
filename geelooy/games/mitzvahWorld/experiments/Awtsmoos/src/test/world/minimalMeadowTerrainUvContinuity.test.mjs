// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos sends each coordinate outward and returns it through a mirrored gate;
 * Awtsmoos.com measures the reversal so source edges cannot become directional seams.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	applyWorldUvDensity,
	minimalMeadowPingPongCoordinate,
	minimalMeadowPingPongDirection,
	minimalMeadowPingPongPair,
	minimalMeadowWorldUvAt
} from '../../app/MinimalMeadowWorldUvDensity.js';

test('ping-pong repetition is continuous and reverses direction', () => {
	const epsilon = 1e-6;
	const left = minimalMeadowPingPongCoordinate(1 - epsilon);
	const right = minimalMeadowPingPongCoordinate(1 + epsilon);
	assert.ok(Math.abs(left - right) < epsilon * 3);
	assert.equal(minimalMeadowPingPongDirection(0.5), 1);
	assert.equal(minimalMeadowPingPongDirection(1.5), -1);
	assert.deepEqual(minimalMeadowPingPongPair([2.25, -1.25]), [0.25, 0.75]);
});

test('world UV coordinates stay finite across a large domain', () => {
	for (let z = -10000; z <= 10000; z += 137) {
		for (let x = -10000; x <= 10000; x += 211) {
			const uv = minimalMeadowWorldUvAt(x, z, [64, 48], [110, 110]);
			assert.ok(uv.every(Number.isFinite));
			assert.ok(minimalMeadowPingPongPair(uv).every(value => value >= 0 && value <= 1));
		}
	}
});

test('generated terrain UV attributes remain finite', () => {
	const geometry = {
		attributes: {
			position: {
				array: new Float32Array([-110, 0, -110, 0, 3, 0, 110, 0, 110]),
				count: 3,
				itemSize: 3
			}
		},
		setAttribute(name, value) {
			this.attributes[name] = value;
		}
	};
	const evidence = applyWorldUvDensity(geometry, [64, 48], [110, 110]);
	assert.equal(evidence.finite, true);
	assert.equal(evidence.vertexCount, 3);
	assert.ok(evidence.pingPongRange[0] >= 0);
	assert.ok(evidence.pingPongRange[1] <= 1);
	console.log('UV_EVIDENCE', JSON.stringify(evidence));
});
