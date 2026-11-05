// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseActors.test.js
 * @description Proves the universe actor director tracks meshes, animates NPC
 * idle and animal wander visually, and untracks cleanly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniverseActorDirector } from './MitzvahWorldUniverseActors.js';

function fakeMesh(x = 10, y = 2, z = -4) {
	return {
		position: { x, y, z },
		rotation: { y: 0 }
	};
}

test('track counts actors and update bobs NPCs without moving their anchor', () => {
	const director = createUniverseActorDirector();
	const mesh = fakeMesh();
	assert.equal(director.track('npc-1', mesh, 'npc'), true);
	assert.equal(director.count(), 1);
	director.update(1.0);
	director.update(2.0);
	assert.equal(mesh.position.x, 10, 'npc must not wander');
	assert.equal(mesh.position.z, -4, 'npc must not wander');
	assert.ok(Math.abs(mesh.position.y - 2) < 0.1, 'npc bobs gently');
});

test('animals wander around their anchor', () => {
	const director = createUniverseActorDirector();
	const mesh = fakeMesh();
	director.track('sheep-1', mesh, 'animal');
	director.update(10.0);
	const dx = mesh.position.x - 10;
	const dz = mesh.position.z + 4;
	const distance = Math.hypot(dx, dz);
	assert.ok(distance > 0.01, 'animal must wander');
	assert.ok(distance <= 1.7, 'animal must stay near its pasture');
});

test('untrack removes the actor and update becomes a no-op', () => {
	const director = createUniverseActorDirector();
	const mesh = fakeMesh();
	director.track('npc-1', mesh, 'npc');
	director.untrack('npc-1');
	assert.equal(director.count(), 0);
	director.update(5.0);
	assert.equal(mesh.position.y, 2);
});

test('track refuses a missing mesh', () => {
	const director = createUniverseActorDirector();
	assert.equal(director.track('ghost', null, 'npc'), false);
	assert.equal(director.count(), 0);
});

test('start and stop are idempotent and safe headless', () => {
	const director = createUniverseActorDirector({ environment: {} });
	director.start();
	director.start();
	director.stop();
	director.stop();
});
