//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { BankService } from '../js/realm/account/bank-service.js';
import { DurabilityService } from '../js/realm/account/durability-service.js';
import { EquipmentService } from '../js/realm/account/equipment-service.js';
import { createRealmState } from '../js/realm/realm-state.js';
import { SkillNetwork } from '../js/realm/skill-network.js';

/**
 * @module AccountItemsBankTest
 * @description
 * Ownership, equipment, wear, repair, and bank storage must conserve every finite
 * object. The Awtsmoos owns without division; Awtsmoos.com proves no tool exists in
 * two places and no repair creates material without cost.
 */
test('equipment respects carried ownership and one explicit slot', () => {
	const service = new EquipmentService();
	const state = createRealmState();
	const scale = state.player.itemIds.find(id => state.items[id].definitionId === 'merchant-scale');
	const equipped = service.equip(state, scale);
	assert.equal(equipped.ok, true);
	assert.equal(equipped.state.equipment.utility, scale);
	const cleared = service.unequip(equipped.state, 'utility');
	assert.equal(cleared.ok, true);
	assert.equal(cleared.state.equipment.utility, null);
	assert.equal(service.equip({ ...state, player: { ...state.player, itemIds: [] } }, scale).ok, false);
});

test('bank stack transfers conserve total quantity', () => {
	const bank = new BankService();
	let state = createRealmState();
	const before = state.player.inventory.coin + state.bank.stacks.coin;
	state = bank.depositStack(state, 'coin', 5).state;
	assert.equal(state.player.inventory.coin + state.bank.stacks.coin, before);
	state = bank.withdrawStack(state, 'coin', 3).state;
	assert.equal(state.player.inventory.coin + state.bank.stacks.coin, before);
});

test('equipped items cannot be banked, but unequipped custody transfers exactly', () => {
	const bank = new BankService();
	const equipment = new EquipmentService();
	let state = createRealmState();
	const hammer = state.equipment.tool;
	assert.equal(bank.depositItem(state, hammer).ok, false);
	state = equipment.unequip(state, 'tool').state;
	state = bank.depositItem(state, hammer).state;
	assert.ok(!state.player.itemIds.includes(hammer));
	assert.ok(state.bank.itemIds.includes(hammer));
	state = bank.withdrawItem(state, hammer).state;
	assert.ok(state.player.itemIds.includes(hammer));
	assert.ok(!state.bank.itemIds.includes(hammer));
});

test('matching work wears equipment and repair consumes material plus coin', () => {
	const durability = new DurabilityService();
	let state = createRealmState();
	const hammer = state.equipment.tool;
	const before = state.items[hammer].durability;
	state = durability.wearForAction(state, 'bridge:timber', 'construction');
	assert.equal(state.items[hammer].durability, before - 1);
	const timber = state.player.inventory.timber;
	const coin = state.player.inventory.coin;
	const repaired = durability.repair(state, hammer);
	assert.equal(repaired.ok, true);
	assert.equal(repaired.state.items[hammer].durability, repaired.state.items[hammer].maxDurability);
	assert.equal(repaired.state.player.inventory.timber, timber - 1);
	assert.equal(repaired.state.player.inventory.coin, coin - 1);
	assert.equal(repaired.state.items[hammer].repairs.length, 1);
});

test('maintained equipment modestly improves matching mastery', () => {
	const skills = new SkillNetwork();
	const equipped = createRealmState();
	const plain = { ...equipped, equipment: { ...equipped.equipment, tool: null } };
	const equippedXp = skills.practice(equipped, 'construction', 'bridge:timber').player.skills.construction.xp;
	const plainXp = skills.practice(plain, 'construction', 'bridge:timber').player.skills.construction.xp;
	assert.ok(equippedXp > plainXp);
});
