/**
 * B"H
 * @module OhrEncounter
 * @description Arrival, facing, dialogue, shop, quest, battle, and gift-law interactions.
 *
 * Chapter 208: Interaction stopped being generic. The Awtsmoos has no body and
 * no form, yet a player now knows the difference between reading a sefer,
 * touching produce, giving to a receiver, facing a guide, and standing in the
 * House of Forgetting to speak the final declaration.
 */
import { State } from '../binah/State.js';
import { tileMeta } from '../data/WorldData.js';
import { encounterById, randomWildEncounter } from '../data/EncounterIndex.js';
import { tileAt, portalAt, transfer } from './OhrWorld.js';
import { startDebate } from './OhrDebate.js';
import { interactQuest } from './OhrQuest.js';
import { openStoryDialogue } from './story/OhrStory.js';
import { learnBook } from './books/TorahBooks.js';
import { doMitzvah, healAtSynagogue } from './holy/HolyPlaces.js';
import { routeSummary } from './abilities/AbilityRuntime.js';
import { grantSkillExp } from './skills/SkillRuntime.js';
import { collectGift } from './rambam/GiftRuntime.js';
import { giveBestGiftToReceiverGlyph } from './rambam/GiftRuntime.js';
import { attemptFinalDeclaration } from './rambam/FinalDeclarationRuntime.js';

const openNpcDialogue = (glyph, meta) => openStoryDialogue(glyph, meta.label || 'NPC', meta.quest || null);
const interactQuestIfPresent = meta => { if (meta.quest) interactQuest(meta); };
const shouldBattle = meta => !!meta.battle && !!meta.encounter;
const canShop = meta => !!meta.shop || meta.role === 'merchant';

const handleBookArrival = meta => { if (!meta.book) return false; interactQuestIfPresent(meta); learnBook(meta.book); return true; };
const handleSynagogueArrival = meta => { if (meta.kind !== 'synagogue') return false; interactQuestIfPresent(meta); healAtSynagogue(meta.label); return true; };
const handleMitzvahArrival = meta => { if (meta.kind !== 'mitzvah') return false; doMitzvah(meta.label); return true; };
const handleGiftArrival = meta => { if (meta.kind !== 'gift') return false; collectGift(meta.gift); interactQuestIfPresent(meta); return true; };
const handleReceiverArrival = glyph => giveBestGiftToReceiverGlyph(glyph);

const handlePortalArrival = (glyph, meta) => {
  if (meta.kind !== 'door' && meta.kind !== 'edge') return false;
  const portal = portalAt(State.Hero.cx, State.Hero.cy, glyph);
  if (portal) transfer(portal);
  return true;
};

const handlePresenceArrival = (glyph, meta) => {
  if (meta.kind !== 'npc' && meta.kind !== 'musag' && meta.kind !== 'receiver') return false;
  if (meta.kind === 'receiver') return handleReceiverArrival(glyph);
  if (meta.kind === 'musag' && shouldBattle(meta)) startDebate(encounterById(meta.encounter));
  else State.say(`${meta.label || 'Guide'} is here. Face them and press Talk.`, 180);
  return true;
};

const practiceTorahRoute = meta => {
  if (State.MapId === 'House_Of_Forgetting') return attemptFinalDeclaration();
  const routes = routeSummary();
  const route = routes[State.Stats.debatesWon % Math.max(1, routes.length)] || 'Mishnah: Judge Favorably';
  State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light + 2);
  grantSkillExp('learning', 3, 'route review');
  const hint = meta.kind === 'road' ? ' Walk east to find the Garden of Ungiven Things.' : '';
  State.say(`Reviewed route: ${route}. +2 light.${hint}`, 260);
};

export const handleArrival = () => {
  const glyph = tileAt(State.Hero.cx, State.Hero.cy);
  const meta = tileMeta(glyph);
  if (handlePortalArrival(glyph, meta)) return;
  if (handleGiftArrival(meta)) return;
  if (handleBookArrival(meta)) return;
  if (handleSynagogueArrival(meta)) return;
  if (handleMitzvahArrival(meta)) return;
  if (meta.questItem) return interactQuest(meta);
  if (handlePresenceArrival(glyph, meta)) return;
  if (meta.kind === 'grass' && Math.random() < (meta.wildChance || 0)) startDebate(randomWildEncounter());
};

export const handleActionFacing = front => {
  const meta = tileMeta(front.tile);
  if (meta.kind === 'gift') return collectGift(meta.gift);
  if (meta.kind === 'receiver') return handleReceiverArrival(front.tile);
  if (meta.kind === 'door') return handleDoorFacing(front, meta);
  if (meta.kind === 'npc' || meta.kind === 'musag') return handlePresenceFacing(front.tile, meta);
  if (meta.quest || meta.questItem) return handleQuestFacing(front.tile, meta);
  if (meta.kind === 'object') return handleObjectFacing(meta);
  if (meta.kind === 'synagogue') return healAtSynagogue(meta.label);
  if (meta.kind === 'mitzvah') return doMitzvah(meta.label);
  practiceTorahRoute(meta);
};

const handleQuestFacing = (glyph, meta) => { openNpcDialogue(glyph, meta); interactQuest(meta); };
const handleDoorFacing = (front, meta) => { const portal = portalAt(front.x, front.y, front.tile); if (portal) transfer(portal); else State.say(`${meta.label || 'Door'} is closed for now.`, 220); };
const handlePresenceFacing = (glyph, meta) => { if (canShop(meta)) return runMerchant(meta); if (shouldBattle(meta)) return startDebate(encounterById(meta.encounter)); openNpcDialogue(glyph, meta); interactQuestIfPresent(meta); };

const runMerchant = meta => {
  openNpcDialogue('נ', meta);
  interactQuestIfPresent(meta);
  if (State.Stats.sparks >= 2) {
    State.Stats.sparks -= 2;
    State.Inventory.items.scroll = (State.Inventory.items.scroll || 0) + 1;
    State.Quests.counters.scroll = (State.Quests.counters.scroll || 0) + 1;
    State.say(`${meta.label}: sold you a parchment פ for 2 sparks. Scrolls now ${State.Inventory.items.scroll}.`, 520);
    return;
  }
  State.say(`${meta.label}: bring 2 sparks and I will sell you a parchment פ.`, 520);
};

const handleObjectFacing = meta => { if (meta.book) learnBook(meta.book); else State.say(`${meta.label}: its letters glow softly.`, 360); };
