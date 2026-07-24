// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWeaponAttachment.test.mjs
 * @description Proves hand-safe parenting and stale-weapon removal through equipment switches.
 * The Awtsmoos grants each tool one truthful bearer; Awtsmoos.com measures that the hand
 * remains unchanged while staff and sword travel through wind-up, release, and recovery.
 */

import assert from 'node:assert/strict';
import {
	attachMinimalWeapon,
	detachMinimalWeapon
} from '../../app/MinimalMeadowWeaponAttachment.js';
import { SimulationSceneNode } from '../../simulation/SimulationSceneNode.js';

const model = new SimulationSceneNode('player-model');
const rightHand = new SimulationSceneNode('mixamorig:RightHand');
const leftHand = new SimulationSceneNode('mixamorig:LeftHand');
const spine = new SimulationSceneNode('mixamorig:Spine2');
model.add(rightHand, leftHand, spine);
rightHand.quaternion.set(0.1, 0.2, 0.3, 0.9);
const handBefore = rightHand.quaternion.toJSON();
const nodes = { leftHand, modelRoot: model, rightHand, spine };
const staff = weapon('staff');
const sword = weapon('sword');

assert.equal(attachMinimalWeapon(staff, nodes, true), true);
assert.equal(staff.parent, rightHand);
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);
assert.equal(staff.userData.attachment, 'right-hand');

assert.equal(attachMinimalWeapon(sword, nodes, true), true);
assert.equal(sword.parent, rightHand);
assert.equal(staff.parent, null);
assert.equal(staff.visible, false);
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);

assert.equal(attachMinimalWeapon(sword, nodes, false), true);
assert.equal(sword.parent, spine);
assert.equal(sword.userData.attachment, 'upper-back');
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);

assert.equal(attachMinimalWeapon(staff, nodes, true, 'left'), true);
assert.equal(staff.parent, leftHand);
assert.equal(sword.parent, null);
assert.equal(sword.visible, false);
detachMinimalWeapon(staff);
assert.equal(staff.parent, null);
assert.equal(staff.visible, false);
console.log('MINIMAL_MEADOW_WEAPON_ATTACHMENT_TEST_OK=1');

function weapon(kind) {
	const node = new SimulationSceneNode(`${kind}-weapon`);
	node.userData.weaponKind = kind;
	return node;
}
