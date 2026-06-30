// B"H
/**
 * @file walletWorldUnificationSmoke.js
 * @description
 * Chapter 422: One purse walks through the village.
 *
 * The Awtsmoos hides a single spark inside trainer tuition, Rebbe rewards,
 * animal loot, equipment vendors, repairs, and tefillin sales. This smoke test
 * does not create a new economy. It forces existing systems to touch the same
 * PersonalPerutaWallet mirror so no subsystem can quietly mint a second truth.
 */
import assert from 'node:assert/strict';
import { trainerOffers, trainAbilityAtTrainer } from '../../ckidsAwtsmoos/systems/trainers/TrainerRuntime.js';
import { acceptQuest, progressQuestObjective, turnInQuest } from '../../ckidsAwtsmoos/systems/missions/QuestGossipRuntime.js';
import { makeLootableCorpse, lootAll } from '../../ckidsAwtsmoos/systems/loot/LootRuntime.js';
import { buyItem, equipItem, equippedItem } from '../../ckidsAwtsmoos/systems/equipment/EquipmentRuntime.js';
import { repairDurability, wearEquipped } from '../../ckidsAwtsmoos/systems/equipment/DurabilityRuntime.js';
import { addBagItem } from '../../ckidsAwtsmoos/systems/inventory/BagRuntime.js';
import { craftTefillin, sellTefillin } from '../../ckidsAwtsmoos/systems/kosher/TefillinCraftingRuntime.js';
import { moneyOf } from '../../ckidsAwtsmoos/systems/economy/wallet/PersonalPerutaWallet.js';

function makeOlam() {
  const events = [];
  return {
    events,
    player: {
      level: 8,
      perutah: 200,
      maxKoach: 100,
      koach: 100,
      inventory: { slots: [], actionSlots: [], equipment: {} }
    },
    ayshPeula: (...args) => events.push(args)
  };
}

function walletHudValues(olam) {
  return olam.events
    .filter(args => args[1] === 'gameHUD' && args[2]?.personalPerutas)
    .map(args => args[2].personalPerutas.personalPerutas);
}

function personalWalletValues(olam) {
  return olam.events
    .filter(args => args[1] === 'personalPerutas')
    .map(args => args[2].personalPerutas);
}

function assertWallet(olam, expected, label) {
  assert.equal(moneyOf(olam.player), expected, `${label}: canonical wallet`);
  assert.equal(olam.player.perutah, expected, `${label}: legacy perutah mirror`);
  assert.equal(olam.player.personalPerutas, expected, `${label}: personal mirror`);
  assert.equal(olam.player.currency, expected, `${label}: currency mirror`);
}

const olam = makeOlam();
const firstOffer = trainerOffers(olam)[0];
const trained = trainAbilityAtTrainer(olam, firstOffer.path, { slot: 2, silent: true });
assert.equal(trained.ok, true, 'training succeeds');
assertWallet(olam, 200 - firstOffer.cost, 'after trainer');

assert.equal(acceptQuest(olam, 'the_first_shliach').ok, true, 'quest accepts');
assert.equal(progressQuestObjective(olam, 'the_first_shliach', 'talk_rebbe').ok, true, 'talk objective progresses');
assert.equal(progressQuestObjective(olam, 'the_first_shliach', 'discover_rebbe_house').ok, true, 'house objective progresses');
assert.equal(turnInQuest(olam, 'the_first_shliach').ok, true, 'quest turns in');
assertWallet(olam, 202, 'after quest reward');

const corpse = makeLootableCorpse(olam, { id: 'deer_wallet_1', species: 'deer', level: 2 });
assert.equal(lootAll(olam, corpse.corpseId).ok, true, 'loot all succeeds');
assertWallet(olam, 204, 'after loot');

const bought = buyItem(olam, 'shechita_knife');
assert.equal(bought.id, 'shechita_knife', 'equipment purchase returns item');
const equipped = equipItem(olam, 'shechita_knife');
assert.equal(equipped.id, 'shechita_knife', 'equipment equips from bag');
assert.equal(equippedItem(olam, 'tool'), 'shechita_knife', 'equipment slot records canonical id');
assertWallet(olam, 156, 'after equipment vendor');
wearEquipped(olam, 50, 'tool');
assert.equal(repairDurability(olam, 'shechita_knife').ok, true, 'repair succeeds');
assertWallet(olam, 132, 'after repair');

addBagItem(olam, 'kosher_cow_leather');
const crafted = craftTefillin(olam);
assert.equal(crafted.ok, true, 'tefillin crafts');
assert.equal(sellTefillin(olam).ok, true, 'tefillin sale succeeds');
assertWallet(olam, 252, 'after tefillin sale');

const hudValues = walletHudValues(olam);
const eventValues = personalWalletValues(olam);
assert.deepEqual(eventValues, hudValues, 'HUD and wallet event values remain paired');
assert.ok(eventValues.includes(252), 'final wallet event reaches listeners');
console.log(JSON.stringify({ ok: true, finalWallet: moneyOf(olam.player), walletEvents: eventValues.length }, null, 2));
