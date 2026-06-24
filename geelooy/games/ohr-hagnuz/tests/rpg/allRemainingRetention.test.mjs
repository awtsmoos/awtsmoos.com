/** B"H - Remaining retention systems integration test. */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { addItem, ensureBag } from '../../src/yesod/bag/BagRuntime.js';
import { harvestNode } from '../../src/yesod/gathering/GatheringRuntime.js';
import { craftRecipe } from '../../src/yesod/crafting/CraftingRuntime.js';
import { addReputation } from '../../src/yesod/reputation/ReputationRuntime.js';
import { spawnHunt, defeatHunt } from '../../src/yesod/hunts/RareHuntRuntime.js';
import { discoverMap, markRegionComplete, worldCompletionSummary } from '../../src/yesod/world/WorldCompletionRuntime.js';
import { performPrestige } from '../../src/yesod/postgame/PrestigeRuntime.js';
import { addBadge, setProfileName, unlockEmote } from '../../src/yesod/social/SocialProfileRuntime.js';
import { evaluateAchievements } from '../../src/yesod/achievements/AchievementRuntime.js';
import { createMemoryStorage } from '../../src/yesod/save/SaveStorage.js';
import { loadGame, saveGame } from '../../src/yesod/save/SaveRuntime.js';

State.Inventory = { money: 0, garments: ['WHITE_LINEN'], books: [], journal: { opened: true, notes: [] }, items: {} };
State.Gathering = null;
State.Crafting = null;
State.Reputation = null;
State.RareHunts = null;
State.WorldCompletion = null;
State.Prestige = null;
State.SocialProfile = null;
State.ItemInstances = null;
State.Achievements = null;
State.Story.active = 'Ohr HaGnuz Revealed';
ensureBag();

assert.equal(harvestNode('orchard_fig_tree').ok, true);
assert.equal(State.Gathering.resources.fig, 2);
assert.equal(craftRecipe('warm_tea').ok, true);
assert.equal(State.Inventory.items.tea, 1);

addItem('spark', 1);
assert.equal(harvestNode('parchment_reed').ok, true);
assert.equal(craftRecipe('scribe_ink').ok, true);
assert.equal(State.Inventory.items.ink, 1);
assert.equal(harvestNode('spark_stone').ok, true);
assert.equal(craftRecipe('luminous_token').ok, true);

assert.equal(addReputation('orchard_keepers', 55, 'test').rank, 'honored');
assert.equal(spawnHunt('hidden_dragon').phase, 'pride');
assert.equal(defeatHunt('hidden_dragon').ok, true);
assert.equal(State.RareHunts.defeats.hidden_dragon, 1);
assert.equal(State.Reputation.factions.hidden_path.rank, 'known');

assert.equal(discoverMap('Overworld_Main', 'Genesis Field').ok, true);
assert.equal(markRegionComplete('Genesis Field').ok, true);
assert.equal(worldCompletionSummary().completeRegions, 1);

setProfileName('Ohr Tester');
addBadge('declaration');
unlockEmote('dance');
assert.equal(State.SocialProfile.name, 'Ohr Tester');
assert.equal(State.SocialProfile.emotes.includes('dance'), true);

State.Achievements = { unlocked: { a: {}, b: {}, c: {} }, points: 30, history: [] };
assert.equal(performPrestige('test').ok, true);
assert.equal(State.Prestige.rank, 1);
evaluateAchievements();

const storage = createMemoryStorage();
saveGame(storage);
State.Gathering = State.Crafting = State.Reputation = State.RareHunts = State.WorldCompletion = State.Prestige = State.SocialProfile = null;
assert.equal(loadGame(storage).ok, true);
assert.equal(State.Gathering.harvests.orchard_fig_tree, 1);
assert.equal(State.Crafting.crafted.warm_tea, 1);
assert.equal(State.Reputation.factions.orchard_keepers.rank, 'honored');
assert.equal(State.RareHunts.defeats.hidden_dragon, 1);
assert.equal(State.WorldCompletion.regions['Genesis Field'].complete, true);
assert.equal(State.Prestige.rank, 1);
assert.equal(State.SocialProfile.badges.includes('declaration'), true);
console.log('BH_ALL_REMAINING_RETENTION_TEST_PASS');
