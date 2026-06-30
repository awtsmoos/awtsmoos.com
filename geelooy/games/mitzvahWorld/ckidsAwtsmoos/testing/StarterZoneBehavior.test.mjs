// B"H
/**
 * @file StarterZoneBehavior.test.mjs
 * @brief Starter-zone behavioral contracts for quests, loot, and spirit recovery.
 *
 * Chapter 461: The test itself bows to one compact vessel. The Rebbe's quest,
 * XP bridge, wallet bridge, loot corpse, and spirit healer are checked together
 * so the starter zone behaves like one world rather than scattered counters.
 */
import assert from 'node:assert/strict';
import {
  acceptQuest,
  ensureMissionState,
  isMissionComplete,
  progressQuestObjective,
  questMarkersPayload,
  questOfferPayload,
  questTrackerPayload,
  turnInQuest
} from '../systems/missions/QuestGossipRuntime.js';
import { gossipPayload } from '../systems/npc/GossipRuntime.js';
import { makeLootableCorpse, lootAll, lootPayload, lootSparklePayload } from '../systems/loot/LootRuntime.js';
import { canResurrectAtCorpse, resurrectAtSpiritHealer, spiritHealerPayload } from '../systems/death/SpiritHealerRuntime.js';
import { ensureDeathState } from '../systems/death/DeathRuntime.js';

function makeOlam() {
  const events = [];
  const player = {
    hp:0, maxHp:100, perutah:0, position:{ x:0, y:0, z:0 },
    mesh:{ position:{ x:0, y:0, z:0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } } }
  };
  return { player, events, aishPeula:null, ayshPeula(kind, name, payload) { events.push({ kind, name, payload }); } };
}

function eventNamed(olam, name, predicate = () => true) {
  return olam.events.find(event => event.name === name && predicate(event.payload || {}));
}

function testQuestLifecycle() {
  const olam = makeOlam();
  const offer = questOfferPayload(olam, 'the_first_shliach');
  assert.equal(offer.ok, true);
  assert.equal(offer.state, 'available');
  assert.equal(offer.buttons.accept, true);

  const accepted = acceptQuest(olam, 'the_first_shliach');
  assert.equal(accepted.ok, true);
  assert.ok(ensureMissionState(olam).active.the_first_shliach);

  const trackerAfterAccept = questTrackerPayload(olam);
  assert.equal(trackerAfterAccept.count, 1);
  assert.equal(trackerAfterAccept.active[0].complete, false);
  assert.equal(progressQuestObjective(olam, 'the_first_shliach', 'talk_rebbe').ok, true);
  assert.equal(isMissionComplete(olam, 'the_first_shliach'), false);
  assert.equal(progressQuestObjective(olam, 'the_first_shliach', 'discover_rebbe_house').ok, true);
  assert.equal(isMissionComplete(olam, 'the_first_shliach'), true);

  const marker = questMarkersPayload(olam).markers.find(entry => entry.missionId === 'the_first_shliach');
  assert.equal(marker.marker, 'yellow-question');
  const turnedIn = turnInQuest(olam, 'the_first_shliach');
  assert.equal(turnedIn.ok, true);
  assert.ok(ensureMissionState(olam).turnedIn.the_first_shliach);
  assert.equal(questTrackerPayload(olam).count, 0);
  assert.equal(olam.player.xp, 45);
  assert.equal(olam.player.perutah, 8);
  assert.equal(olam.player.personalPerutas, 8);
  assert.ok(eventNamed(olam, 'questAccepted'));
  assert.ok(eventNamed(olam, 'questTurnedIn', payload => payload.xp === 45 && payload.personalPerutas === 8));
  assert.ok(eventNamed(olam, 'playerProgress', payload => payload.xp === 45));
  assert.ok(eventNamed(olam, 'gameHUD', payload => payload.xpBar?.xp === 45));
  assert.ok(eventNamed(olam, 'personalPerutas', payload => payload.personalPerutas === 8));
}

function testNpcGossipPayload() {
  const payload = gossipPayload(makeOlam(), 'rebbe');
  assert.equal(payload.open, true);
  assert.equal(payload.npcId, 'rebbe');
  assert.ok(payload.choices.some(choice => choice.kind === 'questAccept' && choice.missionId === 'the_first_shliach'));
}

function testLootLifecycle() {
  const olam = makeOlam();
  const corpse = makeLootableCorpse(olam, { id:'deer_1', name:'Gentle Deer', species:'deer', level:2 });
  assert.ok(corpse.corpseId);
  assert.equal(lootSparklePayload(olam).corpses.length, 1);
  assert.equal(lootPayload(olam, corpse.corpseId).open, true);
  const looted = lootAll(olam, corpse.corpseId);
  assert.equal(looted.ok, true);
  assert.equal(lootSparklePayload(olam).corpses.length, 0);
  assert.equal(olam.player.perutah, 2);
}

function testSpiritRecovery() {
  const olam = makeOlam(), death = ensureDeathState(olam);
  Object.assign(death, { dead:true, ghost:true, graveyard:'starter_graveyard', corpse:{ x:100, z:100 } });
  assert.equal(canResurrectAtCorpse(olam).ok, false);
  assert.equal(spiritHealerPayload(olam).choices.find(choice => choice.id === 'spirit').enabled, true);
  assert.equal(resurrectAtSpiritHealer(olam).ok, true);
  assert.equal(ensureDeathState(olam).ghost, false);
  assert.equal(olam.player.hp, 35);
}

testQuestLifecycle();
testNpcGossipPayload();
testLootLifecycle();
testSpiritRecovery();
console.log(JSON.stringify({ ok:true, checks:['quest-lifecycle', 'npc-gossip', 'loot-lifecycle', 'spirit-recovery'] }, null, 2));
