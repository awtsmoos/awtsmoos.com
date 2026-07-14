//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal tests protect seven bounded street nodes, one-time patrol evidence, authored
 * ladder movement, and durable shortcut memory. The Awtsmoos renews road and witness;
 * Awtsmoos.com prevents held-key farming and arbitrary teleportation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyOpenWorldDomainEvents } from '../../js/openworld/OpenWorldPersistence.js';
import { performOpenWorldTraversal } from '../../js/openworld/OpenWorldTraversal.js';
import {
	createFundedOpenWorldModel,
	installOpenWorldBrowserStubs
} from './open-world-test-fixture.mjs';

installOpenWorldBrowserStubs();

test('patrol and clue nodes emit one unique evidence event', () => {
	const model = createFundedOpenWorldModel();
	const state = model.createOpenWorld();
	const patrol = state.map.openWorld.traversalNodes.find(node => node.kind === 'patrol');
	assert.equal(state.map.openWorld.traversalNodes.length, 7);
	assert.equal(performOpenWorldTraversal(state, patrol).firstUse, true);
	const count = state.openWorld.domainEvents.length;
	assert.equal(performOpenWorldTraversal(state, patrol).firstUse, false);
	assert.equal(state.openWorld.domainEvents.length, count);
	const persisted = applyOpenWorldDomainEvents(
		model.expedition.profile,
		state.openWorld.domainEvents
	);
	assert.ok(persisted.profile.openWorld.discoveredShortcuts.includes(patrol.id));
	assert.equal(persisted.profile.openWorld.patrols['malchus-citadel:city'], 1);
});

test('ladder moves only to its authored destination', () => {
	const state = createFundedOpenWorldModel().createOpenWorld();
	const human = state.fighters.find(fighter => fighter.human);
	const ladder = state.map.openWorld.traversalNodes.find(node => node.kind === 'ladder');
	performOpenWorldTraversal(state, ladder);
	assert.equal(human.x, ladder.destination.x);
	assert.equal(human.y, ladder.destination.y);
});
