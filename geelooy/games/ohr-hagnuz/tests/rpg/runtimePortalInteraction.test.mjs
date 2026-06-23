/** B"H - runtime portal and interaction spine */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { Portals } from '../../src/data/PortalIndex.js';
import { WorldData } from '../../src/data/WorldMaps.js';
import { transfer } from '../../src/yesod/OhrWorld.js';
import { handleActionFacing } from '../../src/yesod/OhrEncounter.js';
import { collectGift, giveGift, ensureGiftLedger } from '../../src/yesod/rambam/GiftRuntime.js';
import { houseCleared } from '../../src/yesod/rambam/ForgettingRuntime.js';

const chain = ['Overworld_Main','Rambam_Garden','Hall_Of_Separation','Levi_Road','Poor_Gate','Jerusalem_Ascent','Orchard_SevenSpecies','Rambam_RecipientCourt','Market_Of_Exchange','House_Of_Forgetting','Sea_Of_Fire','Final_Declaration','Hidden_Orchard','Ohr_HaGanuz_Realm'];
for (const id of chain.slice(1)) assert.ok(WorldData[id], `${id} map exists`);
for (let i = 0; i < chain.length - 1; i += 1) {
  const portal = (Portals[chain[i]] || []).find(p => p.to === chain[i + 1]);
  assert.ok(portal, `${chain[i]} -> ${chain[i + 1]} portal exists`);
  State.MapId = chain[i];
  transfer(portal);
  assert.equal(State.MapId, chain[i + 1], `transfer reaches ${chain[i + 1]}`);
}

State.MapId = 'Market_Of_Exchange';
handleActionFacing({ tile: '2', x: 1, y: 1 });
assert.equal(State.Merchant.accepted.length + State.Merchant.refused.length >= 1, true, 'market action changes merchant state');

ensureGiftLedger();
for (const id of ['terumah','maaser_rishon','maaser_ani','maaser_sheni','bikkurim']) collectGift(id);
for (const [gift, receiver] of [['terumah','kohen'],['maaser_rishon','levi'],['maaser_ani','poor'],['maaser_sheni','jerusalem'],['bikkurim','jerusalem']]) giveGift(gift, receiver);
State.MapId = 'House_Of_Forgetting';
for (let i = 0; i < 6; i += 1) handleActionFacing({ tile: '2', x: 1, y: 1 });
assert.equal(houseCleared(), true, 'house clears through OhrEncounter action');
State.MapId = 'Final_Declaration';
handleActionFacing({ tile: '2', x: 1, y: 1 });
assert.equal(State.Story.active, 'Ohr HaGnuz Revealed', 'final declaration triggers through OhrEncounter action');
console.log('BH_RUNTIME_PORTAL_INTERACTION_TEST_PASS');
