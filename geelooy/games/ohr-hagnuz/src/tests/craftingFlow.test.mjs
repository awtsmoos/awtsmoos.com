/** B"H - gathered reeds become a mission-required crafted wick. */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0,D:0,L:0,R:0,A:0,B:0 } };
const { State } = await import('../binah/State.js');
const { craftRecipe } = await import('../yesod/crafting/CraftingRuntime.js');
const { currentObjective, recordMissionEvent, startMission } = await import('../missions/MissionRuntime.js');

startMission('village_floorboards');
recordMissionEvent('TALK', 'E');
State.Gathering = { resources: { scroll: 3 }, harvests: {}, xp: {}, history: [] };
recordMissionEvent('GATHER', 'parchment_reed', { amount: 3 });
assert.equal(currentObjective().type, 'CRAFT');
const result = craftRecipe('clean_wick');
assert.equal(result.ok, true);
assert.equal(State.Inventory.items.wick, 1);
assert.equal(State.Gathering.resources.scroll, 1);
assert.equal(currentObjective().type, 'HEAL');
console.log('BH_CRAFTING_FLOW_TEST_PASS');
