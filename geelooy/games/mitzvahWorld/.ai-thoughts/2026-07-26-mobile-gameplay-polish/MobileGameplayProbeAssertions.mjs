// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayProbeAssertions.mjs
 * @description Enforces every requested mobile gameplay and browser-health covenant.
 * The Awtsmoos does not confuse appearance with proof; Awtsmoos.com requires wall,
 * garment, weapon, facing, shadow, story, teaching, loot, and network truth together.
 */

import assert from 'node:assert/strict';

export function assertMobileGameplayReceipt(value) {
	assert.equal(value.core.dataset.awtsmoosGameplay, 'true');
	assert.equal(value.core.equipmentSlots.length, 14);
	for (const slot of requiredEquipmentSlots()) {
		assert.ok(value.core.equipmentSlots.includes(slot));
	}
	assert.equal(value.core.equipmentSnapshot.tefillinHead, 'tefillin-shel-rosh');
	assert.equal(value.core.equipmentSnapshot.tefillinArm, 'tefillin-shel-yad');
	assert.equal(value.core.equipment.weaponVisible, true);
	assert.equal(value.core.equipment.drawn, true);
	assert.ok(value.core.walls.some((wall) => {
		return wall.cameraSafeWall && wall.frustumCulled === false;
	}));
	assert.ok(value.core.walls.some((wall) => wall.sidedness === 'front'));
	assert.ok(value.core.demons.every((demon) => {
		return demon.mapped && demon.luminance >= .34;
	}));
	assert.ok(value.core.demons.every((demon) => demon.emissiveStrength === .06));
	assert.equal(value.facing.retained, true);
	assert.equal(value.shlichusOffer.visible, true);
	assert.equal(value.shlichusOffer.acceptButton, true);
	assert.match(value.shlichusOffer.story, /Counsel for the road/);
	assert.equal(value.shlichusProgress.faces, 5);
	assert.match(value.shlichusProgress.text, /1 of 5 demons slain/);
	assert.match(value.shlichusProgress.text, /20% complete/);
	assert.equal(value.teaching.trackerHidden, true);
	assert.equal(value.teaching.parchmentHasCounsel, true);
	assert.equal(value.lootOpen.visible, true);
	assert.ok(value.lootOpen.rows >= 2);
	assert.equal(value.lootCompletion.afterTake.looted, false);
	assert.equal(value.lootCompletion.afterTake.visible, true);
	assert.equal(value.lootCompletion.afterAll.looted, true);
	assert.equal(value.lootCompletion.afterAll.visible, false);
	assert.equal(value.lootCompletion.modalClosed, true);
	assert.deepEqual(value.browserEvidence.consoleErrors, []);
	assert.deepEqual(value.browserEvidence.exceptions, []);
	assert.deepEqual(value.browserEvidence.httpErrors, []);
	assert.deepEqual(value.browserEvidence.requestFailures, []);
}

function requiredEquipmentSlots() {
	return [
		'tefillinHead',
		'tefillinArm',
		'outerShirt',
		'shirt',
		'pants',
		'hand'
	];
}
