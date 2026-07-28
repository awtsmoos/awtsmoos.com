// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowAttachmentRegistry.test.mjs
 * @description Proves one hand anchor, one slot object, hydration rebinding, and bounded repair.
 * The Awtsmoos renews body and tool without duplicate ownership; Awtsmoos.com follows the staff
 * from fallback model to hydrated hand while stale anchors and competing attachments disappear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowAttachmentRegistry } from '../../app/MinimalMeadowAttachmentRegistry.js';
import { MINIMAL_MEADOW_WEAPON_ANCHOR_NAME } from '../../app/MinimalMeadowWeaponAnchor.js';

test('B"H registry cleans duplicates and rebinds one weapon to each model generation', () => {
	const first = modelFixture('first');
	first.model.add(namedAnchor());
	first.hand.add(namedAnchor());
	const registry = new MinimalMeadowAttachmentRegistry();
	registry.bindModel(first.nodes, true);
	assert.equal(countAnchors(first.model), 1);
	const weapon = new Group();
	weapon.userData.weaponKind = 'staff';
	registry.setWeapon(weapon, true);
	assert.equal(weapon.parent.parent, first.hand);
	assert.equal(weapon.userData.handBound, true);
	assert.equal(weapon.userData.attachmentGeneration, 1);
	const competing = new Group();
	competing.userData.AwtsmoosEquipmentSlot = 'hand';
	weapon.parent.add(competing);
	registry.attach(true);
	assert.equal(competing.parent, null);
	assert.equal(competing.visible, false);
	const second = modelFixture('hydrated');
	registry.bindModel(second.nodes, true);
	assert.equal(weapon.parent.parent, second.hand);
	assert.equal(weapon.userData.attachmentGeneration, 2);
	assert.equal(countAnchors(second.model), 1);
	weapon.parent.remove(weapon);
	weapon.visible = false;
	for (let frame = 0; frame < 15; frame += 1) registry.tick(second.model, true);
	assert.equal(weapon.parent.parent, second.hand);
	assert.equal(registry.diagnostics().valid, true);
});

function modelFixture(name) {
	const model = new Group();
	model.name = name;
	const hand = new Group();
	hand.name = 'mixamorigRightHand';
	model.add(hand);
	return { hand, model, nodes: { modelRoot: model, rightHand: hand } };
}
function namedAnchor() {
	const anchor = new Group();
	anchor.name = MINIMAL_MEADOW_WEAPON_ANCHOR_NAME;
	return anchor;
}
function countAnchors(model) {
	let count = 0;
	model.traverse(node => {
		if (node.name === MINIMAL_MEADOW_WEAPON_ANCHOR_NAME) count += 1;
	});
	return count;
}
