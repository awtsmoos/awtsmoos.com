// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerActionSystem.test.mjs
 * @description Verifies distinct staff, sword, and future registered custom-action contracts.
 * The Awtsmoos creates imported motion and new deed without erasure; Awtsmoos.com measures
 * equipment truth, semantic bones, release singularity, and extensibility directly.
 */

import assert from 'node:assert/strict';
import { minimalMeadowClipForState } from '../../app/MinimalMeadowAnimationClipPolicy.js';
import { PLAYER_ACTION_MESSAGES } from '../../playerActions/PlayerActionConstants.js';
import { createPlayerActionSystem } from '../../playerActions/PlayerActionSystem.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { createPlayerActionTestModel } from './playerActionTestModel.mjs';

const bus = new AwtsmoosEventBus();
const equipment = { weaponItemId: 'wooden-staff' };
const model = createPlayerActionTestModel();
const system = createPlayerActionSystem({
	actorId: 'test-player',
	bridge: false,
	bus,
	equipment,
	model
});

assert.deepEqual(
	system.registry.list().map(definition => definition.id).sort(),
	['staff.cast', 'sword.cast']
);
assert.notEqual(
	system.registry.get('staff.cast').messageType,
	system.registry.get('sword.cast').messageType
);
assertImportedClipsRemainAvailable();

let staffReleases = 0;
let swordReleases = 0;
bus.on('player.action.staff.release', () => { staffReleases += 1; });
bus.on('player.action.sword.release', () => { swordReleases += 1; });

system.dispatch({
	phase: 'start',
	type: PLAYER_ACTION_MESSAGES.staffCast
});
system.update(0.45);
assert.equal(system.snapshot().activeActionId, 'staff.cast');
assert.notEqual(model.bones.rightArm.quaternion.w, 1);
releaseTwice(PLAYER_ACTION_MESSAGES.staffCast);
assert.equal(staffReleases, 1);
system.update(0.4);
assert.equal(system.snapshot().activeActionId, null);

equipment.weaponItemId = 'spark-blade';
system.dispatch({
	phase: 'start',
	type: PLAYER_ACTION_MESSAGES.swordCast
});
assert.equal(system.snapshot().activeActionId, 'sword.cast');
releaseTwice(PLAYER_ACTION_MESSAGES.swordCast);
assert.equal(swordReleases, 1);
system.update(0.4);

registerFutureBlessing();
system.dispatch({
	phase: 'start',
	type: 'player.action.gesture.blessing'
});
system.update(0.2);
assert.equal(system.snapshot().activeActionId, 'gesture.blessing');
releaseTwice('player.action.gesture.blessing');
system.update(0.2);
assert.equal(system.snapshot().activeActionId, null);
assert.ok(system.snapshot().actor.boundBones >= 10);
system.destroy();
console.log('PLAYER_ACTION_SYSTEM_TEST_OK=1');

function assertImportedClipsRemainAvailable() {
	const names = [
		'stand_Armature',
		'walk_Armature',
		'run_Armature',
		'jump_Armature'
	];
	assert.equal(minimalMeadowClipForState(names, 'walking'), 'walk_Armature');
	assert.equal(minimalMeadowClipForState(names, 'running'), 'run_Armature');
	assert.equal(minimalMeadowClipForState(names, 'jumping'), 'jump_Armature');
}

function releaseTwice(type) {
	system.dispatch({ phase: 'release', type });
	system.dispatch({ phase: 'release', type });
}

function registerFutureBlessing() {
	system.register({
		autoRelease: false,
		duration: 0.5,
		id: 'gesture.blessing',
		keyframes: [
			{ at: 0, pose: { head: [0, 0, 0] } },
			{ at: 1, pose: { head: [-0.12, 0.08, 0] } }
		],
		layer: 'upper-body',
		messageType: 'player.action.gesture.blessing',
		priority: 10,
		recovery: 0.1,
		releaseAt: 0.8,
		releaseEvent: 'player.action.gesture.blessing.release',
		version: 1
	});
}
