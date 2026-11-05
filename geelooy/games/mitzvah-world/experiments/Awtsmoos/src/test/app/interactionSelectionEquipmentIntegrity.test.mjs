// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interactionSelectionEquipmentIntegrity.test.mjs
 * @description Guards living target identity, cast payload, and repaired right-hand equipment.
 * The Awtsmoos joins selection, speech, hand, and tool without flattening their vessels;
 * Awtsmoos.com keeps actor methods and the physical staff present through pointer and hydration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEquipmentRuntime } from '../../app/MinimalMeadowEquipmentRuntime.js';
import { minimalCombatCastPayload } from '../../app/MinimalMeadowCombatSupport.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { WorldTargetPopulationAdapter } from '../../ui/WorldTargetPopulationAdapter.js';
import {
	IntegrityEnemyActor,
	integrityModernPopulation
} from './interactionCollisionVisualIntegrityFixture.mjs';
import {
	inventoryEquipmentPlayerModel
} from '../gameplay/inventoryEquipmentModelFixture.mjs';

const HAND_ANCHOR = 'Awtsmoos_equipped_weapon_hand_anchor';

test('B"H modern pointer selection preserves actor methods through combat', () => {
	const actor = new IntegrityEnemyActor();
	const population = integrityModernPopulation(actor);
	const adapter = new WorldTargetPopulationAdapter(population, 0);
	const candidate = adapter.candidateFromPointer({});
	assert.equal(candidate.subject, actor);
	adapter.activateCandidate(candidate);
	assert.equal(population.selected, actor);
	assert.equal(actor.targeted, 1);
	const payload = minimalCombatCastPayload({
		action: { castTime: 1, label: 'Light', letters: 'אור' },
		actionId: 'light',
		elapsed: 0.25,
		progress: 0.25,
		target: candidate
	});
	assert.equal(payload.target.id, 'integrity-shadow');
	adapter.clearAll();
	assert.equal(actor.cleared, 1);
});

test('B"H equipped staff belongs to the right hand and repairs', () => {
	const runtime = {
		bus: new AwtsmoosEventBus(),
		inventory: new InventoryStore(),
		model: null
	};
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	const player = inventoryEquipmentPlayerModel('visible-hand-anchor');
	runtime.model = player.model;
	equipment.bindModel(player.model);
	assert.equal(equipment.weapon.parent.name, HAND_ANCHOR);
	assert.equal(equipment.weapon.parent.parent, player.rightHand);
	assert.equal(equipment.weapon.userData.handBound, true);
	assert.equal(equipment.weapon.visible, true);
	equipment.weapon.parent.remove(equipment.weapon);
	equipment.update();
	assert.equal(equipment.weapon.parent.name, HAND_ANCHOR);
	assert.equal(equipment.weapon.parent.parent, player.rightHand);
	equipment.destroy();
});
