// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileGameplayPolishCore.test.mjs
 * @description Guards walls, facing, equipment, demon surfaces, living Shlichus, and teaching placement.
 * The Awtsmoos reveals visible truth through direct laws; Awtsmoos.com derives mobile mission
 * assertions from the current quest definition instead of freezing an earlier chapter's wording.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { houseMaterial } from '../../app/MinimalMeadowHouseMaterials.js';
import { installMinimalMeadowHouseSurfacePolicy } from '../../app/MinimalMeadowHouseSurfacePolicy.js';
import {
	MINIMAL_DEMON_EMISSIVE_STRENGTH,
	normalizeMinimalDemonTint
} from '../../app/MinimalMeadowDemonMaterial.js';
import { relativeLuminance } from '../../app/MinimalMeadowDemonReadabilityMetrics.js';
import { MINIMAL_MEADOW_DEMON_QUEST } from '../../app/MinimalMeadowQuestDefinition.js';
import { retainedMinimalMeadowTravelFacing } from '../../app/MinimalMeadowTravelFacingPolicy.js';
import { INVENTORY_EQUIPMENT_SLOT_IDS } from '../../gameplay/InventoryEquipmentSlots.js';
import { initialInventoryState } from '../../gameplay/InventoryStoreTransactions.js';
import {
	minimalMeadowQuestParchmentMarkup,
	minimalMeadowQuestTrackerMarkup
} from '../../ui/MinimalMeadowQuestPresentation.js';
import {
	TEACHING_PLACEMENTS,
	TeachingPlacementPreference
} from '../../ui/TeachingPlacementPreference.js';
import {
	fakeHouseMesh,
	memoryStorage,
	mobileQuestSnapshot
} from './mobileGameplayPolishFixture.mjs';

test('B"H only thin exterior walls receive mobile camera-safe reverse faces', () => {
	assert.equal(houseMaterial('floor').doubleSided, false);
	const exterior = fakeHouseMesh('exterior-side-wall');
	const floor = fakeHouseMesh('level-interior-floor');
	const exteriorReceipt = installMinimalMeadowHouseSurfacePolicy(exterior);
	const floorReceipt = installMinimalMeadowHouseSurfacePolicy(floor);
	assert.equal(exterior.material.doubleSided, true);
	assert.equal(exterior.material.backfaceCull, false);
	assert.equal(exterior.frustumCulled, false);
	assert.equal(exteriorReceipt.cameraSafeWall, true);
	assert.equal(floor.material.doubleSided, false);
	assert.equal(floorReceipt.sidedness, 'front');
});

test('B"H released controls retain the last meaningful travel facing', () => {
	const facing = retainedMinimalMeadowTravelFacing({ x: 2, z: 0 }, 0, 0);
	assert.equal(facing, Math.PI / 2);
	assert.equal(retainedMinimalMeadowTravelFacing({ x: 0, z: 0 }, facing, -1), facing);
});

test('B"H Bag exposes every authoritative slot and starts with both tefillin', () => {
	assert.equal(INVENTORY_EQUIPMENT_SLOT_IDS.length, 14);
	for (const slot of ['tefillinHead', 'tefillinArm', 'outerShirt', 'shirt', 'pants', 'hand']) {
		assert.ok(INVENTORY_EQUIPMENT_SLOT_IDS.includes(slot));
	}
	const state = initialInventoryState();
	assert.equal(state.equipment.tefillinHead, 'tefillin-shel-rosh');
	assert.equal(state.equipment.tefillinArm, 'tefillin-shel-yad');
	assert.equal(state.equipment.hand, 'wooden-staff');
});

test('B"H demon surface remains dark-themed but visibly textured', () => {
	const tint = normalizeMinimalDemonTint([0.08, 0.03, 0.09, 1]);
	assert.ok(relativeLuminance(tint) >= 0.34);
	assert.ok(relativeLuminance(tint) <= 0.43);
	assert.equal(MINIMAL_DEMON_EMISSIVE_STRENGTH, 0.06);
	assert.ok(tint.slice(0, 3).every(channel => channel >= 0.14 && channel <= 0.66));
});

test('B"H Shlichus presents current road roles and changes from defeat to recovery', () => {
	const parchment = minimalMeadowQuestParchmentMarkup(
		mobileQuestSnapshot('available', 0),
		TEACHING_PLACEMENTS.SIDE
	);
	const defeatTracker = minimalMeadowQuestTrackerMarkup(
		mobileQuestSnapshot('active', 1, 'defeat')
	);
	const recoveryTracker = minimalMeadowQuestTrackerMarkup(
		mobileQuestSnapshot('active', 1, 'recover')
	);
	const objectiveCount = MINIMAL_MEADOW_DEMON_QUEST.objective.count;
	assert.equal(objectiveCount, MINIMAL_MEADOW_DEMON_QUEST.requiredArchetypes.length);
	assert.equal(MINIMAL_MEADOW_DEMON_QUEST.faces.length, 4);
	assert.match(parchment, /Accept the Shlichus/);
	assert.match(parchment, /Counsel for the road/);
	assert.ok(defeatTracker.includes(MINIMAL_MEADOW_DEMON_QUEST.objective.description));
	assert.ok(recoveryTracker.includes(MINIMAL_MEADOW_DEMON_QUEST.recoveryObjective.description));
	assert.match(defeatTracker, /17% complete/);
	assert.match(recoveryTracker, /67% complete/);
	assert.equal((defeatTracker.match(/data-state=/g) || []).length, objectiveCount);
	assert.equal((recoveryTracker.match(/data-state=/g) || []).length, objectiveCount);
});

test('B"H teaching placement persists side or book-only mode', () => {
	const storage = memoryStorage();
	const preference = new TeachingPlacementPreference(storage);
	assert.equal(preference.snapshot(), TEACHING_PLACEMENTS.SIDE);
	assert.equal(preference.toggle(), TEACHING_PLACEMENTS.BOOK_ONLY);
	assert.equal(new TeachingPlacementPreference(storage).snapshot(), TEACHING_PLACEMENTS.BOOK_ONLY);
});
