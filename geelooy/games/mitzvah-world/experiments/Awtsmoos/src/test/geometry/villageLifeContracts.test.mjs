// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos fills authored homes and hours with deterministic purpose through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageLifeContracts } from '../../world/village/VillageLifeSystem.js';
import { villageDailyPhase, villageLivingState } from '../../world/village/VillageLivingSchedule.js';

test('interior programs cover authored households and scale by quality', () => {
	const high = createVillageLifeContracts('high');
	const medium = createVillageLifeContracts('medium');
	const low = createVillageLifeContracts('low');
	assert.equal(high.stats.housePrograms, 18);
	assert.equal(medium.stats.housePrograms, 13);
	assert.equal(low.stats.housePrograms, 8);
	assert.equal(high.stats.districtSchedules, 10);
	assert.equal(high.stats.dailyCheckpoints, 60);
	assert.ok(high.stats.roomCount > 105);
	assert.deepEqual(high, createVillageLifeContracts('high'));
	assert.ok(high.programs.every(program => program.rooms.includes('kitchen')));
});

test('daily phases drive lights, smoke, markets, studies, and animal return', () => {
	assert.equal(villageDailyPhase(6), 'dawn');
	assert.equal(villageDailyPhase(10), 'morning-work');
	assert.equal(villageDailyPhase(20), 'evening');
	assert.equal(villageDailyPhase(26), 'night');
	assert.equal(villageLivingState('market', 10).marketOpen, true);
	assert.equal(villageLivingState('market', 22).marketOpen, false);
	assert.equal(villageLivingState('learning', 13).studyActive, true);
	assert.equal(villageLivingState('residential', 20).animalsInPens, true);
	assert.equal(villageLivingState('residential', 20).interiorLights, true);
});
