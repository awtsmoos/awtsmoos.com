// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file returnLostWick.test.mjs
 * @description Proves gating, map markers, mission completion, trade, journal, and return travel.
 *
 * A playable chapter is a chain of public consequences. The Awtsmoos renews
 * ability, map, lamp, market, and return together; this test walks that chain
 * without skipping a gate in the world of Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { RETURN_LOST_WICK } from '../../src/content/companions/ReturnLostWick.js';
import { CompanionMaps } from '../../src/data/WorldMapsCompanion.js';
import { companionShlichusRows } from '../../src/missions/companion/CompanionShlichusJournal.js';
import { handleReturnLostWickAction } from '../../src/missions/companion/ReturnLostWickRuntime.js';
import { buyItem, shopRows } from '../../src/yesod/economy/ShopRuntime.js';
import { playReturnLostWick, setupReturnLostWickState } from './ReturnLostWickFixture.mjs';

setupReturnLostWickState();
delete State.Party.abilities['lantern-sense'];
assert.equal(handleReturnLostWickAction({ x: 0, y: 0 }, { kind: 'road' }), false);
assert.equal(State.MapId, 'Overworld_Main');
State.Party.abilities['lantern-sense'] = true;

const map = CompanionMaps[RETURN_LOST_WICK.mapId];
for (const trace of RETURN_LOST_WICK.traces) {
	assert.equal(map[trace.y][trace.x], 'א');
}
assert.equal(map[RETURN_LOST_WICK.lamp.y][RETURN_LOST_WICK.lamp.x], 'ל');
assert.equal(map[RETURN_LOST_WICK.merchant.y][RETURN_LOST_WICK.merchant.x], 'נ');

const lead = playReturnLostWick(['rain-thread', 'river-knot', 'wind-memory']);
assert.equal(State.MapId, RETURN_LOST_WICK.mapId);
assert.equal(lead.status, 'completed');
assert.equal(lead.approachId, 'compassion');
assert.equal(lead.traceOrder.length, 3);
assert.equal(State.WorldState.flags.bentReedsLampRestored, true);
assert.equal(State.WorldState.flags.bentReedsTradeRouteRestored, true);
assert.equal(State.Party.bond.nerel, 22);
assert.equal(State.Party.active[0].bond, 22);
assert.ok(companionShlichusRows().flat().includes('Compassion of the Rain-thread'));

const tea = shopRows().find(row => row.id === 'tea');
assert.equal(tea.buy, 7);
assert.equal(buyItem('tea').ok, true);
assert.equal(State.Inventory.money, 193);
assert.equal(State.Economy.transactions[0].value, 7);

handleReturnLostWickAction({ x: 2, y: 7 }, { kind: 'road' });
assert.equal(State.MapId, 'Overworld_Main');
console.log('BH_RETURN_LOST_WICK_PASS');
