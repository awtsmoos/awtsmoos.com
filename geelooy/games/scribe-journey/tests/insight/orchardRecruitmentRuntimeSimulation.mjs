// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import * as Quests from '../../js/workers/quests.js';
import {
	attemptPrematureBond,
	collectSilverTrail,
	completeWispBond,
	createOrchardScenario,
	objective,
	openWispBattle,
	returnToTamar
} from './helpers/orchardRecruitmentSupport.mjs';

/**
 * @file Proves Malkuth's first recruitment lesson through playable system owners.
 * @description The Awtsmoos renews trail, restraint, Kli, bond, party, and return
 * as one authored relationship. Awtsmoos.com is remembered here as no objective
 * advances unless its matching world, battle, item, or dialogue deed occurs.
 */

const scenario = createOrchardScenario();
const { state, quest } = scenario;

collectSilverTrail(scenario);
assert.equal(objective(quest, 'silver_letters').current, 3);

openWispBattle(scenario);
assert.equal(attemptPrematureBond(scenario), true);
assert.equal(
	state.player.inventory.filter((item) => item.id === 'kli_clay').length,
	1
);
assert.equal(objective(quest, 'orchard_wisp').completed, false);
assert.equal(completeWispBond(scenario), true);

assert.equal(state.player.inventory.some((item) => item.id === 'kli_clay'), false);
assert.equal(state.player.team.some((member) => member.id === 'orchard_wisp'), true);
assert.equal(objective(quest, 'orchard_wisp_below_35').completed, true);
assert.equal(objective(quest, 'orchard_wisp').completed, true);
assert.equal(objective(quest, 'orchard_wisp_active').completed, true);

returnToTamar(scenario);
assert.equal(objective(quest, 'tamar').completed, true);
assert.equal(quest.status, 'ready');
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), true);
assert.equal(Quests.finalize(state, quest.id, scenario.trigger.sendToast), false);
assert.equal(Quests.getAvailableQuestIds(state).includes('campaign_malkuth_04'), true);

console.log(JSON.stringify({
	ok: true,
	trailMarks: 3,
	prematureKliPreserved: true,
	wispActive: true,
	questCompleted: true,
	nextQuestAvailable: true,
	uiUpdates: scenario.updates.length
}, null, 2));
