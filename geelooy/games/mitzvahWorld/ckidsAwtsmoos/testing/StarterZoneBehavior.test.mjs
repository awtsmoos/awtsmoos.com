// B"H
/**
 * @file StarterZoneBehavior.test.mjs
 * @brief Behavioral starter-zone contracts for quests, loot, and spirit recovery.
 *
 * Chapter 459: The village stopped being a painted backdrop. The Rebbe's first
 * mission is accepted, objectives move from breath to ledger, corpses sparkle
 * with actual loot, and the spirit healer restores the fallen shliach. These
 * tests are deliberately tiny but behavioral: they assert state transitions,
 * emitted UI events, and payload shapes that a player-facing starter zone needs.
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
import {
  makeLootableCorpse,
  lootAll,
  lootPayload,
  lootSparklePayload
} from '../systems/loot/LootRuntime.js';
import {
  canResurrectAtCorpse,
  resurrectAtSpiritHealer,
  spiritHealerPayload
} from '../systems/death/SpiritHealerRuntime.js';
import { ensureDeathState } from '../systems/death/DeathRuntime.js';

function makeOlam() {
  const events = [];
  const player = {
    hp: 0,
    maxHp: 100,
    perutah: 0,
    position: { x: 0, y: 0, z: 0 },
    mesh: {
      position: {
        x: 0,
        y: 0,
        z: 0,
        set(x, y, z) { this.x = x; this.y = y; this.z = z; }
      }
    }
  };
  return {
    player,
    events,
    aishPeula: null,
    ayshPeula(kind, name, payload) { events.push({ kind, name, payload }); }
  };
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
  assert.ok(olam.events.some(event => event.name === 'questAccepted'));
  assert.ok(olam.events.some(event => event.name === 'questTurnedIn'));
}

function testNpcGossipPayload() {
  const olam = makeOlam();
  const payload = gossipPayload(olam, 'rebbe');
  assert.equal(payload.open, true);
  assert.equal(payload.npcId, 'rebbe');
  assert.ok(payload.choices.some(choice => (
    choice.kind === 'questAccept' && choice.missionId === 'the_first_shliach'
  )));
}

function testLootLifecycle() {
  const olam = makeOlam();
  const corpse = makeLootableCorpse(olam, {
    id: 'deer_1',
    name: 'Gentle Deer',
    species: 'deer',
    level: 2
  });
  assert.ok(corpse.corpseId);
  assert.equal(lootSparklePayload(olam).corpses.length, 1);
  assert.equal(lootPayload(olam, corpse.corpseId).open, true);
  const looted = lootAll(olam, corpse.corpseId);
  assert.equal(looted.ok, true);
  assert.equal(lootSparklePayload(olam).corpses.length, 0);
  assert.equal(olam.player.perutah, 2);
}

function testSpiritRecovery() {
  const olam = makeOlam();
  const death = ensureDeathState(olam);
  death.dead = true;
  death.ghost = true;
  death.graveyard = 'starter_graveyard';
  death.corpse = { x: 100, z: 100 };
  assert.equal(canResurrectAtCorpse(olam).ok, false);
  const panel = spiritHealerPayload(olam);
  assert.equal(panel.open, true);
  assert.equal(panel.choices.find(choice => choice.id === 'spirit').enabled, true);
  const rez = resurrectAtSpiritHealer(olam);
  assert.equal(rez.ok, true);
  assert.equal(ensureDeathState(olam).ghost, false);
  assert.equal(olam.player.hp, 35);
}

testQuestLifecycle();
testNpcGossipPayload();
testLootLifecycle();
testSpiritRecovery();
console.log(JSON.stringify({
  ok: true,
  checks: ['quest-lifecycle', 'npc-gossip', 'loot-lifecycle', 'spirit-recovery']
}, null, 2));
