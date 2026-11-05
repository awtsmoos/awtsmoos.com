// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerAnimationSimulationHarness.mjs
 * @description Samples real GLB locomotion, semantic bones, and calibrated hand-anchor integrity.
 * The Awtsmoos renews each simulated frame; Awtsmoos.com verifies locomotion first,
 * bounded deed composition second, and one generation-owned weapon anchor beneath the right hand.
 */

import assert from 'node:assert/strict';
import { minimalMeadowLocomotionState } from '../../app/MinimalMeadowAnimationClipPolicy.js';

export function sampleComposedFrame(
	simulation,
	deltaSeconds = 1 / 60,
	observedBones = null,
	observedRoles = []
) {
	const runtime = simulation.runtime;
	const stateName = minimalMeadowLocomotionState({
		state: {
			...runtime.state,
			moving: simulationInputIsMoving(runtime.input)
		}
	});
	runtime.importedAnimation.sample(stateName, runtime.equipment.weaponItemId);
	const importedPose = observedBones
		? snapshotBones(observedBones, observedRoles)
		: null;
	runtime.playerActionSystem.runtime.captureImportedPose();
	runtime.playerActionSystem.update(deltaSeconds);
	return {
		clip: runtime.importedAnimation.current,
		importedPose,
		stateName
	};
}

export function semanticBones(model) {
	const names = {
		head: 'mixamorig:Head',
		hips: 'mixamorig:Hips',
		leftHand: 'mixamorig:LeftHand',
		leftLeg: 'mixamorig:LeftLeg',
		rightArm: 'mixamorig:RightArm',
		rightHand: 'mixamorig:RightHand',
		rightLeg: 'mixamorig:RightLeg',
		spine: 'mixamorig:Spine2'
	};
	const result = {};
	model.traverse(node => {
		for (const [role, name] of Object.entries(names)) {
			if (node.name === name) result[role] = node;
		}
	});
	return result;
}

export function snapshotBones(bones, roles) {
	return Object.fromEntries(roles.map(role => [role, bones[role].quaternion.toJSON()]));
}

export function assertBonesEqual(bones, expected) {
	for (const [role, quaternion] of Object.entries(expected)) {
		assert.deepEqual(bones[role].quaternion.toJSON(), quaternion, role);
	}
}

export function assertWeaponBoundToHand(equipment) {
	const anchor = equipment.weapon.parent;
	assert.ok(anchor, 'Weapon requires an attachment anchor.');
	assert.equal(anchor.parent, equipment.nodes.rightHand);
	assert.equal(anchor.userData?.AwtsmoosWeaponAnchor?.attachmentDomain, 'hand');
}

export function runRecovery(simulation, messageType, bones, roles) {
	const equipment = simulation.runtime.equipment;
	simulation.dispatchAction(messageType, 'release');
	assertWeaponBoundToHand(equipment);
	for (
		let index = 0;
		index < 30 && simulation.runtime.playerActionSystem.runtime.active;
		index += 1
	) {
		const frame = sampleComposedFrame(simulation, 1 / 30, bones, roles);
		assertBonesEqual(bones, frame.importedPose);
		assertWeaponBoundToHand(equipment);
	}
	assert.equal(simulation.runtime.playerActionSystem.runtime.active, null);
}

function simulationInputIsMoving(input) {
	const axis = input?.axis?.() || {};
	const forward = (Number(axis.forward) || 0) + (Number(axis.joystickForward) || 0);
	const strafe = (Number(axis.strafe) || 0) + (Number(axis.joystickStrafe) || 0);
	return Math.hypot(forward, strafe) > 0.0001;
}
