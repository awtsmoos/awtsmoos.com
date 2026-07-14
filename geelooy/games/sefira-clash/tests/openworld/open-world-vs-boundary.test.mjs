//B"H
//Boruch Hashem
//Blessed is He

/**
 * VS boundary tests prove Hands Covenant removes item vessels without reading lived-city
 * technique rank. The Awtsmoos renews city lesson and contest separately; Awtsmoos.com
 * uses the real normalized lobby rules path and rejects accidental competitive advantage.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MAPS } from '../../js/data/maps.js';
import { rulesForMatchMode } from '../../js/multiplayer/MatchModeCatalog.js';
import { createMatchRules } from '../../js/multiplayer/MatchRules.js';
import { GameModel } from '../../js/session/GameModel.js';

installBrowserStubs();

test('Hands Covenant removes item state and ignores Open World ranks', () => {
	const model = modelWithMasteredOpenWorld();
	model.lobby.rules = createMatchRules(rulesForMatchMode('hands'));
	model.createMatch(MAPS[0], 'vs', 0);
	assert.equal(model.state.rules.handsOnly, true);
	assert.equal(model.state.rules.items, false);
	assert.deepEqual(model.state.weapons, []);
	assert.deepEqual(model.state.powerups, []);
	for (const fighter of model.state.fighters) {
		assert.equal(fighter.heldWeapon, null);
		assert.equal(fighter.loadout.handsOnly, true);
		assert.equal(fighter.openWorldTechnique, undefined);
		assert.equal(fighter.expeditionLoadout, undefined);
	}
});

test('ordinary Duel remains distinct from Hands Covenant', () => {
	const model = new GameModel();
	model.lobby.rules = createMatchRules(rulesForMatchMode('duel'));
	model.createMatch(MAPS[0], 'vs', 0);
	assert.equal(model.state.rules.handsOnly, false);
	assert.equal(model.state.rules.modeId, 'duel');
});

function modelWithMasteredOpenWorld() {
	const model = new GameModel();
	model.expedition.replaceProfile({
		...model.expedition.profile,
		openWorld: {
			...model.expedition.profile.openWorld,
			techniques: {
				punchRank: 3,
				kickRank: 3,
				mastery: { 'rising-answer': 999 }
			}
		}
	});
	return model;
}

function installBrowserStubs() {
	const memory = new Map();
	globalThis.localStorage = {
		getItem: key => memory.get(key) || null,
		setItem: (key, value) => memory.set(key, value),
		removeItem: key => memory.delete(key)
	};
	globalThis.performance = { now: () => 1000 };
}
