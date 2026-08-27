// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWeaponAttachment.test.mjs
 * @description Proves one calibrated right-hand anchor and stale-weapon replacement.
 * The Awtsmoos grants each tool one truthful bearer; Awtsmoos.com keeps the hand quaternion
 * unchanged while staff and sword replace one another inside the generation-owned hand slot.
 */

import assert from 'node:assert/strict';
import {
	attachMinimalWeapon,
	detachMinimalWeapon
} from '../../app/MinimalMeadowWeaponAttachment.js';
import {
	MINIMAL_MEADOW_WEAPON_ANCHOR_NAME
} from '../../app/MinimalMeadowWeaponAnchor.js';
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

assert.equal(attachMinimalWeapon(staff, nodes, true, { generation: 1 }), true);
assert.equal(staff.parent.name, MINIMAL_MEADOW_WEAPON_ANCHOR_NAME);
assert.equal(staff.parent.parent, rightHand);
assert.equal(staff.userData.attachment, 'hand-drawn');
assert.equal(staff.userData.attachmentGeneration, 1);
assert.equal(staff.userData.handBound, true);
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);

assert.equal(attachMinimalWeapon(sword, nodes, true, { generation: 1 }), true);
assert.equal(sword.parent.name, MINIMAL_MEADOW_WEAPON_ANCHOR_NAME);
assert.equal(sword.parent.parent, rightHand);
assert.equal(staff.parent, null);
assert.equal(staff.visible, false);
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);

assert.equal(attachMinimalWeapon(sword, nodes, false, { generation: 1 }), true);
assert.equal(sword.parent.name, MINIMAL_MEADOW_WEAPON_ANCHOR_NAME);
assert.equal(sword.parent.parent, rightHand);
assert.equal(sword.userData.attachment, 'hand-sheathed');
assert.deepEqual(rightHand.quaternion.toJSON(), handBefore);

assert.equal(countAnchors(model), 1);
detachMinimalWeapon(sword);
assert.equal(sword.parent, null);
assert.equal(sword.visible, false);
console.log('MINIMAL_MEADOW_WEAPON_ATTACHMENT_TEST_OK=1');

function weapon(kind) {
	const node = new SimulationSceneNode(`${kind}-weapon`);
	node.userData.weaponKind = kind;
	return node;
}

function countAnchors(root) {
	let count = 0;
	root.traverse(node => {
		if (node.name === MINIMAL_MEADOW_WEAPON_ANCHOR_NAME) count += 1;
	});
	return count;
}
