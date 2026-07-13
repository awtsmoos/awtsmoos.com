// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { malkuthCampaignQuests } from '../../js/data/quests/campaign/malkuth.js';
import { chooseScribeName, chooseStarter } from '../../js/workers/systems/quests/questOnboarding.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = createDefaultGameState();
state.db.quests = malkuthCampaignQuests;
assert(Quests.accept(state, 'campaign_malkuth_01'), 'First campaign quest could not be accepted.');
assert(!chooseScribeName(state, '   '), 'Blank Scribe name should be rejected.');
assert(chooseScribeName(state, 'Miriam the Scribe'), 'Valid Scribe name was rejected.');
assert(state.player.name === 'Miriam the Scribe', 'Scribe name did not persist in state.');
assert(chooseStarter(state, 'alephling'), 'Alephling could not be chosen.');
assert(state.player.team[0].id === 'alephling', 'Alephling was not placed first.');
assert(state.player.storage.some(member => member.id === 'clay_golem'), 'Previous lead was not preserved in storage.');
assert(chooseStarter(state, 'golemet'), 'Golemet could not replace Alephling.');
assert(state.player.team[0].id === 'golemet', 'Golemet was not placed first.');
assert(state.player.storage.filter(member => member.id === 'alephling').length === 1, 'Alephling was not preserved exactly once.');
assert(chooseStarter(state, 'alephling'), 'Alephling could not be reselected.');
assert(state.player.team.filter(member => member.id === 'alephling').length === 1, 'Alephling duplicated in the party.');
assert(state.player.storage.filter(member => member.id === 'alephling').length === 0, 'Selected starter remained duplicated in storage.');
assert(state.player.team.length <= 6, 'Party exceeded the six-Musag limit.');

const quest = state.player.activeQuests.find(entry => entry.id === 'campaign_malkuth_01');
assert(quest.objectives.find(entry => entry.targetId === 'player_name_chosen').completed, 'Name objective did not complete.');
assert(quest.objectives.find(entry => entry.targetId === 'starter_musag').completed, 'Starter objective did not complete.');
assert(quest.objectives.find(entry => entry.targetId === 'starter_equipped').completed, 'Party slot objective did not complete.');

console.log(JSON.stringify({
	ok: true,
	name: state.player.name,
	lead: state.player.team[0].id,
	teamSize: state.player.team.length,
	storageSize: state.player.storage.length
}, null, 2));
