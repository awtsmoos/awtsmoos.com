// B"H
/**
 * Chapter 6: The Inventory Crown And The Speaking Street.
 *
 * The Awtsmoos contracts into a second test gate: NPC schema, quest markers,
 * wood shlichus, inventory vessels, action bar slots, and the first Chumash
 * must testify together. This does not guess at runtime; it reads the exact
 * manifests and setup modules that the game already uses.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const gameRoot = path.resolve('geelooy/games/mitzvahWorld');
const worldRoot = path.join(gameRoot, 'ckidsAwtsmoos/Olam/worlds/mitzvahWorld');

function readGame(relativePath) {
  return fs.readFileSync(path.join(gameRoot, relativePath), 'utf8');
}

function readWorld(relativePath) {
  return fs.readFileSync(path.join(worldRoot, relativePath), 'utf8');
}

function mustMatch(text, regex, label) {
  assert.ok(regex.test(text), `${label} must match ${regex}`);
}

const npcSchema = readWorld('data/manifests/NpcInteractionSchema.js');
const chumash = readWorld('data/manifests/ChumashPassages.js');
const shlichus = readGame('ckidsAwtsmoos/tochen/shlichus/shlichusManifest.js');
const registry = readGame('ckidsAwtsmoos/systems/inventory/data/registry.js');
const inventorySetup = readGame('ckidsAwtsmoos/chayim/chossid/methods/inventory-setup.js');
const shlichusMethods = readGame('ckidsAwtsmoos/chayim/chai/methods/shlichus.js');

mustMatch(npcSchema, /requiredNpcFields[\s\S]*interactable[\s\S]*proximity/, 'NPC schema');
mustMatch(npcSchema, /questMarker|missionMarker|exclamation/, 'NPC quest marker');
mustMatch(npcSchema, /npc_reb_yosei[\s\S]*gather_emerald_wood/, 'wood quest NPC binding');
mustMatch(npcSchema, /npc_reb_shlomo[\s\S]*hasTorahDebate[\s\S]*opensBattleDebate/, 'Torah debate NPC binding');

mustMatch(shlichusMethods, /acceptMission[\s\S]*activeMissions/, 'quest acceptance state');
mustMatch(shlichusMethods, /updateQuestProgress[\s\S]*advanceMission/, 'quest progress state');
mustMatch(shlichusMethods, /completeMission[\s\S]*rewards/, 'quest completion rewards');
mustMatch(shlichus, /gather_emerald_wood[\s\S]*collect[\s\S]*Wood[\s\S]*rewards/, 'wood mission manifest');

mustMatch(registry, /"Wood"[\s\S]*stackSize[\s\S]*isQuestItem/, 'Wood item registry');
mustMatch(registry, /"Chumash"[\s\S]*readable[\s\S]*rightHand/, 'Chumash item registry');
mustMatch(registry, /"TorahPassage"[\s\S]*isDebateCard/, 'Torah passage item registry');

mustMatch(inventorySetup, /book_chumash_bereishis[\s\S]*passageIds/, 'starting Chumash inventory');
mustMatch(inventorySetup, /passage_bereishis_1_1[\s\S]*isDebateCard/, 'starting passage inventory');
mustMatch(inventorySetup, /actionSlots\[0\][\s\S]*actionSlots\[1\]/, 'action bar placement');

mustMatch(chumash, /bereishis_1_1[\s\S]*pshat[\s\S]*remez[\s\S]*derush[\s\S]*sod/, 'Bereishis PaRDeS');
mustMatch(chumash, /shemos_20_2[\s\S]*Chumash/, 'second Chumash passage');

console.log('B"H - steps 31-50 contract passed.');
