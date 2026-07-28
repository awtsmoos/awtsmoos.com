// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { PLAYER_ACTION_MESSAGES } from '../../playerActions/PlayerActionConstants.js';
import { GameplaySimulation } from '../../simulation/GameplaySimulation.js';
import {
	assertBonesEqual,
	runRecovery,
	sampleComposedFrame,
	semanticBones
} from './playerAnimationSimulationHarness.mjs';

/**
 * @file playerAnimationCompositionSimulation.test.mjs
 * @description Runs full movement and casting timelines against the remote Chossid GLB.
 * The Awtsmoos joins air, earth, garment, and deed in one living story;
 * Awtsmoos.com verifies remote imported legs beneath independent upper-body actions.
 */

const simulation = await GameplaySimulation.create({
	fixedStep: 1 / 60,
	modelPath: PLAYER_MODEL_URL,
	speed: 240
});
const bones = semanticBones(simulation.runtime.model);
const lowerRoles = ['hips', 'leftLeg', 'rightLeg'];
assert.ok(Object.values(bones).every(Boolean));

assertFrame('standing', /stand/i);
simulation.move({ forward: 1 });
simulation.runFor(0.2);
assertFrame('walking', /walk/i);
simulation.setRun(true);
simulation.runFor(0.2);
assertFrame('running', /run/i);
simulation.stopMoving();
simulation.setRun(false);
simulation.jump();
simulation.runFor(0.05);
assert.equal(simulation.runtime.state.grounded, false);
assertFrame('jumping', /jump/i);
advanceUntil(state => !state.grounded && state.velY < 0, 60);
assertFrame('falling', /fall/i);
advanceUntil(state => state.grounded, 180);
assert.equal(simulation.runtime.state.grounded, true);
assert.notEqual(sampleComposedFrame(simulation).stateName, 'falling');

await runCast('wooden-staff', PLAYER_ACTION_MESSAGES.staffCast, false, false);
await runCast('wooden-staff', PLAYER_ACTION_MESSAGES.staffCast, true, false);
await runCast('wooden-staff', PLAYER_ACTION_MESSAGES.staffCast, true, true);
await runCast('spark-blade', PLAYER_ACTION_MESSAGES.swordCast, false, false);
await runCast('spark-blade', PLAYER_ACTION_MESSAGES.swordCast, true, false);
await runCast('spark-blade', PLAYER_ACTION_MESSAGES.swordCast, true, true);
simulation.destroy();
console.log('PLAYER_ANIMATION_COMPOSITION_SIMULATION_TEST_OK=1');

function assertFrame(expectedState, clipPattern) {
	const frame = sampleComposedFrame(simulation);
	assert.equal(frame.stateName, expectedState);
	assert.match(frame.clip, clipPattern);
}

function advanceUntil(predicate, maximumFrames) {
	for (let index = 0; index < maximumFrames; index += 1) {
		simulation.runFor(1 / 60);
		if (predicate(simulation.runtime.state)) return;
	}
	assert.fail(`State transition was not reached within ${maximumFrames} frames`);
}

async function runCast(itemId, messageType, moving, running) {
	simulation.stopMoving();
	simulation.setRun(running);
	if (moving) {
		simulation.move({ forward: 1 });
		simulation.runFor(0.1);
	}
	simulation.equip(itemId);
	simulation.runtime.equipment.setDrawn(true);
	const expectedBase = moving ? (running ? 'running' : 'walking') : 'standing';
	assert.equal(sampleComposedFrame(simulation).stateName, expectedBase);
	simulation.dispatchAction(messageType, 'start');
	for (let index = 0; index < 8; index += 1) {
		const frame = sampleComposedFrame(simulation, 1 / 60, bones, lowerRoles);
		assert.equal(frame.stateName, expectedBase);
		assertBonesEqual(bones, frame.importedPose);
		assert.equal(
			simulation.runtime.equipment.weapon.parent,
			simulation.runtime.equipment.nodes.rightHand
		);
	}
	runRecovery(simulation, messageType, bones, lowerRoles);
}
