/**
 * B"H
 * @test Runtime portal, market, House, and declaration interaction spine.
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { Portals } from '../../src/data/PortalIndex.js';
import { WorldData } from '../../src/data/WorldMaps.js';
import { transfer } from '../../src/yesod/OhrWorld.js';
import { handleActionFacing } from '../../src/yesod/OhrEncounter.js';
import { collectGift, giveGift, ensureGiftLedger } from '../../src/yesod/rambam/GiftRuntime.js';
import { houseCleared } from '../../src/yesod/rambam/ForgettingRuntime.js';

const chain = ['Overworld_Main', 'Rambam_Garden', 'Hall_Of_Separation', 'Levi_Road', 'Poor_Gate', 'Jerusalem_Ascent', 'Orchard_SevenSpecies', 'Rambam_RecipientCourt', 'Market_Of_Exchange', 'House_Of_Forgetting', 'Sea_Of_Fire', 'Final_Declaration', 'Hidden_Orchard', 'Ohr_HaGanuz_Realm'];
for (const id of chain.slice(1)) assert.ok(WorldData[id], `${id} map exists`);
for (let index = 0; index < chain.length - 1; index += 1) {
	const portal = (Portals[chain[index]] || []).find(entry => entry.to === chain[index + 1]);
	assert.ok(portal, `${chain[index]} -> ${chain[index + 1]} portal exists`);
	State.MapId = chain[index];
	transfer(portal);
	assert.equal(State.MapId, chain[index + 1], `transfer reaches ${chain[index + 1]}`);
}

State.MapId = 'Market_Of_Exchange';
handleActionFacing({ tile: 'נ', x: 2, y: 2 });
assert.equal(State.Economy.activeShopId, 'merchant_exchange', 'market merchant opens the exchange shop');
assert.equal(State.UiPanel, 'shop', 'market interaction exposes the shop panel');

ensureGiftLedger();
for (const id of ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim']) collectGift(id);
for (const [gift, receiver] of [['terumah', 'kohen'], ['maaser_rishon', 'levi'], ['maaser_ani', 'poor'], ['maaser_sheni', 'jerusalem'], ['bikkurim', 'jerusalem']]) giveGift(gift, receiver);
State.MapId = 'House_Of_Forgetting';
for (let index = 0; index < 6; index += 1) handleActionFacing({ tile: '2', x: 1, y: 1 });
assert.equal(houseCleared(), true, 'house clears through OhrEncounter action');
State.MapId = 'Final_Declaration';
handleActionFacing({ tile: '2', x: 1, y: 1 });
assert.equal(State.Story.active, 'Ohr HaGnuz Revealed', 'legacy declaration reaches its revealed ending');
console.log('BH_RUNTIME_PORTAL_INTERACTION_TEST_PASS');
