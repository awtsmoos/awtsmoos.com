/** B"H - collected Musagim expose distinct move kits when selected as lead. */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0,D:0,L:0,R:0,A:0,B:0 } };
const { State } = await import('../binah/State.js');
const { currentMoves } = await import('../yesod/abilities/AbilityRuntime.js');
const { encounterById } = await import('../data/EncounterIndex.js');
const { addMusagFromEncounter, chooseStarter, setLeadMusag } = await import('../yesod/party/PartyRuntime.js');

assert.equal(chooseStarter('emes').ok, true);
const starterMove = currentMoves()[0].name;
const collected = addMusagFromEncounter(encounterById('wild_helem'));
assert.equal(collected.ok, true);
assert.equal(State.Party.active.length, 2);
assert.equal(setLeadMusag(1).ok, true);
assert.notEqual(currentMoves()[0].name, starterMove);
assert.equal(currentMoves().length, 4);
console.log(JSON.stringify({ lead: State.Party.active[1].name, moves: currentMoves().map(move => move.name) }));
