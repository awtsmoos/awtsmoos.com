// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplaySimulation.test.mjs
 * @description Exercises the real GLB manifest and gameplay laws without DOM or WebGL.
 * The Awtsmoos creates many measured seconds in one present; Awtsmoos.com inspects
 * movement, jumping, collision, combat, equipment recovery, NPC identity, and accelerated time.
 */

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { GameplaySimulation } from '../../simulation/GameplaySimulation.js';

const modelPath = fileURLToPath(
	new URL('../../../../../assets/models/player/chossid.glb', import.meta.url)
);
const simulation = await GameplaySimulation.create({
	fixedStep: 1 / 60,
	modelPath,
	speed: 240
});

assert.equal(typeof document, 'undefined');
assertRealModel(simulation.snapshot());
assertFriendlyActors(simulation.runtime.friendlyActors);

simulation.move({ forward: 1 });
simulation.setRun(true);
simulation.runFor(0.5);
simulation.stopMoving();
assert.ok(simulation.snapshot().movement.distance > 0);
assert.equal(simulation.snapshot().state.runMode, true);

simulation.jump();
simulation.runFor(0.05);
assert.equal(simulation.snapshot().state.jumpsUsed, 1);
assert.equal(simulation.snapshot().state.grounded, false);
simulation.jump();
simulation.runFor(0.05);
assert.equal(simulation.snapshot().state.jumpsUsed, 2);
simulation.runFor(2);
assert.equal(simulation.snapshot().state.grounded, true);

const collisionPosition = { x: 0, y: 0, z: 2.8 };
const collision = simulation.runtime.collisionWorld.move(
	collisionPosition,
	{ x: 0, y: 0, z: 2 },
	{
		blockSteepFloors: false,
		floorY: 0,
		grounded: true,
		maxStepHeight: 0.42,
		maxSlopeNormal: 0.58
	}
);
assert.ok(collision.contacts > 0);
assert.ok(collisionPosition.z < 3.5);

simulation.equip('spark-blade');
assert.equal(
	simulation.snapshot().equipment.weaponItemId,
	'spark-blade'
);
let swordReleaseCount = 0;
const stopReleaseListener = simulation.runtime.bus.on(
	'player.action.sword.release',
	() => { swordReleaseCount += 1; }
);
simulation.cycleTarget();
const healthBefore = simulation.snapshot().enemies.actors[0].health;
assert.equal(simulation.cast('hebrew-fire').accepted, true);
simulation.runFor(3);
const afterCombat = simulation.snapshot();
assert.ok(afterCombat.enemies.actors[0].health < healthBefore);
assert.equal(swordReleaseCount, 1);
assert.equal(afterCombat.equipment.casting, false);
assert.equal(afterCombat.scheduler.pending, 0);
stopReleaseListener();

simulation.runFor(20);
const finalSnapshot = simulation.snapshot();
assert.ok(finalSnapshot.clock.fasterThanRealtime > 1);
assert.ok(finalSnapshot.clock.simulatedSeconds > 25);
assert.ok(finalSnapshot.collision.triangles >= 12);
simulation.destroy();
console.log('GAMEPLAY_SIMULATION_TEST_OK=1');

function assertRealModel(snapshot) {
	assert.match(snapshot.model.source, /chossid\.glb$/);
	assert.ok(snapshot.model.nodes > 0);
	assert.ok(snapshot.model.bones > 0);
	assert.ok(snapshot.model.meshCount > 0);
	assert.ok(snapshot.model.skins > 0);
	assert.ok(snapshot.model.animationNames.length > 0);
	assert.equal(snapshot.importedAnimation.simulatedWebgl, true);
}

function assertFriendlyActors(actors) {
	assert.equal(actors.length, 2);
	assert.equal(
		actors[0].gltf.manifest.source,
		actors[1].gltf.manifest.source
	);
	assert.notEqual(actors[0].gltf.scene, actors[1].gltf.scene);
	assert.notEqual(actors[0].gltf.nodes[0], actors[1].gltf.nodes[0]);
}
