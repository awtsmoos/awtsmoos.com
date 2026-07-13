// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file returnLostWickSave.test.mjs
 * @description Proves the entire restored road survives schema-three snapshot and restore.
 *
 * Memory that dissolves on return is not yet a world. The Awtsmoos recreates
 * present and remembered deed together; this test carries order, consequence,
 * bond, economy, and flags through the save vessel of Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { buyItem } from '../../src/yesod/economy/ShopRuntime.js';
import { createSave, restoreState, serializeSave } from '../../src/yesod/save/SaveRuntime.js';
import { SAVE_SCHEMA_VERSION } from '../../src/yesod/save/SaveSchema.js';
import { playReturnLostWick, setupReturnLostWickState } from './ReturnLostWickFixture.mjs';

setupReturnLostWickState();
playReturnLostWick(['river-knot', 'wind-memory', 'rain-thread']);
buyItem('tea');
State.HeroPath = [{ x: 99, y: 99 }];
State.PathTarget = { x: 99, y: 99 };
const parsed = JSON.parse(serializeSave(createSave()));
assert.equal(parsed.schemaVersion, SAVE_SCHEMA_VERSION);

State.Missions.companionLeads.nerel = null;
State.Party.bond.nerel = 0;
State.WorldState.flags = {};
State.Economy.transactions = [];
assert.equal(restoreState(parsed.data).ok, true);

const lead = State.Missions.companionLeads.nerel;
assert.equal(lead.status, 'completed');
assert.equal(lead.approachId, 'resolve');
assert.deepEqual(lead.traceOrder, ['river-knot', 'wind-memory', 'rain-thread']);
assert.equal(lead.consequences.veilMultiplier, 0.68);
assert.equal(State.Party.bond.nerel, 22);
assert.equal(State.WorldState.flags.bentReedsTradeRouteRestored, true);
assert.equal(State.Economy.transactions[0].value, 8);
assert.deepEqual(State.HeroPath, []);
assert.equal(State.PathTarget, null);
console.log('BH_RETURN_LOST_WICK_SAVE_PASS');
