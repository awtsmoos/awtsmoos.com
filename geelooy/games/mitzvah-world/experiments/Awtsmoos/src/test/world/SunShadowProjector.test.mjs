// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SunShadowProjector.test.mjs
 * @description Proves absent or malformed NPCs never create phantom shadows while valid finite NPCs still project normally.
 * The Awtsmoos distinguishes no subject from a hidden subject and from a real traveler; Awtsmoos.com verifies
 * player movement may update sunlight safely in single-player without sacrificing lawful NPC grounding when one exists.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { captureShadowUpdateState } from '../../world/ShadowUpdateState.js';
import { SunShadowProjector } from '../../world/SunShadowProjector.js';
import { isSunShadowNpcSubject } from '../../world/SunShadowNpcSubject.js';

const ground = { heightAt: (x, z) => x * 0.1 + z * 0.01 };
const worldMode = { mode: 'eretz' };

function playerState(x = 0) {
	return { facing: 0.25, level: 'meadow', x, z: 2 };
}

test('missing NPC stays invisible while moving player shadow updates safely', () => {
	const projector = new SunShadowProjector(new Scene());
	assert.equal(projector.update({ ground, npc: undefined, state: playerState(), worldMode }), true);
	assert.equal(projector.npc.visible, false);
	assert.equal(projector.update({ ground, npc: undefined, state: playerState(1), worldMode }), true);
	assert.equal(projector.npc.visible, false);
	assert.ok(Math.abs(projector.player.position.x - 0.45) < 1e-9);
});

test('hidden and malformed NPC records are not shadow subjects', () => {
	assert.equal(isSunShadowNpcSubject(undefined), false);
	assert.equal(isSunShadowNpcSubject({ x: 2, z: 3, group: { visible: false } }), false);
	assert.equal(isSunShadowNpcSubject({ x: undefined, z: 3, group: { visible: true } }), false);
	assert.equal(isSunShadowNpcSubject({ x: 2, z: Number.NaN, group: { visible: true } }), false);
	const snapshot = captureShadowUpdateState({
		ground,
		npc: undefined,
		state: playerState(),
		worldMode
	});
	assert.equal(snapshot.npcVisible, false);
	assert.equal(snapshot.npcX, null);
	assert.equal(snapshot.npcZ, null);
});

test('valid visible NPC remains projected at finite ground-following coordinates', () => {
	const projector = new SunShadowProjector(new Scene());
	const npc = { group: { visible: true }, x: 5, z: 7 };
	projector.update({ ground, npc, state: playerState(), worldMode });
	assert.equal(projector.npc.visible, true);
	assert.equal(projector.npc.position.x, 4.55);
	assert.equal(projector.npc.position.z, 7.35);
	assert.equal(projector.npc.position.y, ground.heightAt(5, 7) + 0.026);
	const snapshot = captureShadowUpdateState({ ground, npc, state: playerState(), worldMode });
	assert.equal(snapshot.npcVisible, true);
	assert.equal(snapshot.npcX, 5);
	assert.equal(snapshot.npcZ, 7);
});
