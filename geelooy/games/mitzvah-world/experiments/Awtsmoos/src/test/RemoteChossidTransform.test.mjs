// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_SPAWN } from '../app/EretzPlayerStateFactory.js';
import {
	remoteInterpolationFactor,
	remoteWorldTarget,
	shortestFacingDelta
} from '../network/RemoteChossidActor.js';

test('world-space tab snapshots render at their exact coordinates without ID offsets', () => {
	const ground = { heightAt: () => 999 };
	const remote = {
		coordinateSpace: 'world',
		id: 'any-hash-at-all',
		position: { x: 18.25, y: 7.75, z: -31.5 }
	};
	assert.deepEqual(remoteWorldTarget(remote, ground, 2), remote.position);
	assert.deepEqual(
		remoteWorldTarget({ ...remote, id: 'different-hash' }, ground, 2),
		remote.position
	);
});

test('remote position and facing use bounded frame interpolation', () => {
	const blendAt60Fps = remoteInterpolationFactor(1 / 60);
	assert.ok(blendAt60Fps > 0 && blendAt60Fps < 1);
	const interpolatedX = 0 + (12 - 0) * blendAt60Fps;
	assert.ok(interpolatedX > 0 && interpolatedX < 12);
	assert.ok(shortestFacingDelta(Math.PI * 2 - 0.2) < 0);
	assert.ok(shortestFacingDelta(-Math.PI * 2 + 0.2) > 0);
});

test('legacy server-relative snapshots retain only the documented village spawn transform', () => {
	const ground = { heightAt: (x, z) => x + z };
	assert.deepEqual(remoteWorldTarget({
		position: { x: 2, y: 0, z: -3 }
	}, ground, 1.5), {
		x: PLAYER_SPAWN.x + 2,
		y: PLAYER_SPAWN.x + 2 + PLAYER_SPAWN.z - 3 + 1.5,
		z: PLAYER_SPAWN.z - 3
	});
});
