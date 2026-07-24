//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { RealmActionEngine } from '../js/realm/realm-action-engine.js';
import { RealmEconomy } from '../js/realm/realm-economy.js';
import { RealmEventEngine } from '../js/realm/realm-event-engine.js';
import { RealmProjects } from '../js/realm/realm-projects.js';
import { createRealmState } from '../js/realm/realm-state.js';

/**
 * @module RealmEconomyProjectsEventsTest
 * @description
 * Goods remain conserved while bridge, workshop, market, emergencies, mastery, and
 * memory alter one persistent settlement. The Awtsmoos creates abundance; this
 * Awtsmoos.com contract forbids finite systems from manufacturing it dishonestly.
 */
test('economy conserves inputs through crafting and rejects shortages', () => {
	const economy = new RealmEconomy();
	let state = createRealmState();
	const woodBefore = state.player.inventory.wood;
	const timberBefore = state.player.inventory.timber;
	const crafted = economy.craft(state, 'timber');
	assert.equal(crafted.ok, true);
	assert.equal(crafted.state.player.inventory.wood, woodBefore - 2);
	assert.equal(crafted.state.player.inventory.timber, timberBefore + 1);
	state = {
		...crafted.state,
		player: {
			...crafted.state.player,
			inventory: { ...crafted.state.player.inventory, herbs: 0 }
		}
	};
	assert.equal(economy.craft(state, 'medicine').ok, false);
});

test('bridge restoration changes trade conditions and settlement state', () => {
	const projects = new RealmProjects();
	const economy = new RealmEconomy();
	let state = createRealmState();
	state = {
		...state,
		player: {
			...state.player,
			inventory: { ...state.player.inventory, timber: 8, stone: 6 }
		}
	};
	const priceBefore = economy.price(state, 'medicine');
	for (let index = 0; index < 8; index += 1) {
		state = projects.contributeBridge(state, 'timber').state;
	}
	for (let index = 0; index < 6; index += 1) {
		state = projects.contributeBridge(state, 'stone').state;
	}
	assert.equal(state.bridge.complete, true);
	assert.ok(economy.price(state, 'medicine') < priceBefore);
	assert.ok(state.settlement.trade > 34 && state.settlement.trust > 22);
});

test('workshop upgrades consume resources and add persistent home features', () => {
	const projects = new RealmProjects();
	let state = createRealmState();
	state = {
		...state,
		player: {
			...state.player,
			inventory: { ...state.player.inventory, timber: 20, stone: 20, coin: 60 }
		}
	};
	for (let level = 0; level < 3; level += 1) {
		state = projects.upgradeWorkshop(state).state;
	}
	assert.equal(state.home.workshop, 3);
	assert.ok(state.home.features.includes('workshop'));
	assert.ok(state.home.features.includes('guest-room'));
	assert.equal(state.home.stories.length, 3);
});

test('emergencies start, resolve, and improve the affected settlement field', () => {
	const events = new RealmEventEngine();
	let state = events.start(createRealmState());
	assert.equal(state.event.family, 'rescue');
	const healthBefore = state.settlement.health;
	state = events.respond(state, 'search').state;
	state = events.respond(state, 'search').state;
	assert.equal(state.event, null);
	assert.ok(state.settlement.health > healthBefore);
});

test('action engine records one consequence and credits active event mastery', () => {
	const engine = new RealmActionEngine();
	const events = new RealmEventEngine();
	let state = events.start(createRealmState());
	state = { ...state, event: { ...state.event, progress: 2 } };
	const chronicleBefore = state.chronicle.length;
	const rescueBefore = state.player.skills.rescue.xp;
	const outcome = engine.run(state, 'event:search');
	assert.equal(outcome.state.event, null);
	assert.equal(outcome.state.chronicle.length, chronicleBefore + 1);
	assert.ok(outcome.state.player.skills.rescue.xp > rescueBefore);
	assert.equal(outcome.state.memory[0].type, 'rescue');
});
