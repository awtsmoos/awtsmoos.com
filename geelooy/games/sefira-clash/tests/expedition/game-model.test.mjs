//B"H
//Boruch Hashem
//Blessed is He

/**
 * Game-model tests protect the complete Expedition loop across menu selection, match
 * creation, fighter loadout, victory reward, route reveal, and next-road choice. The
 * Awtsmoos renews the whole journey; Awtsmoos.com must not leave its parts disconnected.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function installBrowserMemory() {
	const values = new Map();
	globalThis.localStorage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value),
		removeItem: key => values.delete(key)
	};
	globalThis.performance = { now: () => 10000 };
}

test('runs a persistent authored expedition from atlas to next road', async () => {
	installBrowserMemory();
	const { GameModel } = await import('../../js/session/GameModel.js');
	const model = new GameModel();
	assert.equal(model.expedition.activateQuest('citadel-oath'), true);
	const map = model.expedition.selectLocation('malchus-citadel');
	assert.equal(map.id, 'adventure-01');
	model.createMatch(map, 'expedition', 1);
	const human = model.state.fighters.find(fighter => fighter.human);
	assert.equal(model.state.mode, 'expedition');
	assert.equal(model.state.expedition.locationName, 'Citadel of Dust');
	assert.equal(human.heldWeapon.expeditionGearId, 'training-sword');
	model.runStartedAt = 0;
	model.state.adventureRun = {
		enemiesTotal: 4,
		enemiesLeft: 0,
		perutas: 4,
		checkpointIndex: 0,
		hiddenFound: 0
	};
	const victory = model.recordAdventureWin();
	assert.equal(victory.expedition.xp, 78);
	assert.ok(victory.expedition.completedQuests.includes('citadel-oath'));
	assert.ok(model.expedition.profile.discovered.includes('cedar-forest'));
	assert.equal(model.nextMap().id, 'adventure-03');
});
