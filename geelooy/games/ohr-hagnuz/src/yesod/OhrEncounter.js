/**
 * B"H
 * @module OhrEncounter
 * @description Arrival, facing, dialogue, shop, quest, battle, gift-law, Merchant, House, and Declaration interactions.
 *
 * Chapter 317: The game stopped waiting for the report to be true. The
 * Awtsmoos creates every interaction from nothing every instant; now touching
 * a market temptation, a forgotten room, a receiver, a gift, or the final
 * declaration calls the actual runtime that changes the world.
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
import { collectGift, giveBestGiftToReceiverGlyph } from './rambam/GiftRuntime.js';
import { attemptFinalDeclaration } from './rambam/FinalDeclarationRuntime.js';
import { clearForgettingRoom, remainingForgettingRooms } from './rambam/ForgettingRuntime.js';
import { merchantOffers, refuseMerchantOffer, acceptMerchantOffer } from './rambam/MerchantRuntime.js';

const openNpcDialogue = (glyph, meta) => openStoryDialogue(glyph, meta.label || 'NPC', meta.quest || null);
const interactQuestIfPresent = meta => { if (meta.quest) interactQuest(meta); };
const shouldBattle = meta => !!meta.battle && !!meta.encounter;
const canShop = meta => !!meta.shop || meta.role === 'merchant';

const handleBookArrival = meta => { if (!meta.book) return false; interactQuestIfPresent(meta); learnBook(meta.book); return true; };
const handleSynagogueArrival = meta => { if (meta.kind !== 'synagogue') return false; interactQuestIfPresent(meta); healAtSynagogue(meta.label); return true; };
const handleMitzvahArrival = meta => { if (meta.kind !== 'mitzvah') return false; doMitzvah(meta.label); return true; };
const handleGiftArrival = meta => { if (meta.kind !== 'gift') return false; collectGift(meta.gift); interactQuestIfPresent(meta); return true; };
const handleReceiverArrival = glyph => giveBestGiftToReceiverGlyph(glyph);

const campaignRegion = () => ({
  Rambam_Garden: 'Garden of Ungiven Things', Hall_Of_Separation: 'Hall of Separation', Levi_Road: 'Road of Levi Songs',
  Poor_Gate: 'Poor Gate', Jerusalem_Ascent: 'Jerusalem Ascent', Orchard_SevenSpecies: 'Orchard of Seven Species',
  Rambam_RecipientCourt: 'Court of Rightful Receivers', Market_Of_Exchange: 'Market of Exchange', House_Of_Forgetting: 'House of Forgetting',
  Sea_Of_Fire: 'Sea of Fire', Final_Declaration: 'Final Declaration', Hidden_Orchard: 'Hidden Orchard', Ohr_HaGanuz_Realm: 'Ohr HaGanuz Realm'
}[State.MapId] || State.Story?.region || State.MapId);

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

const handleSpecialMapAction = () => {
  if (State.MapId === 'Final_Declaration') return attemptFinalDeclaration();
  if (State.MapId === 'House_Of_Forgetting') return clearNextHouseRoom();
  if (State.MapId === 'Market_Of_Exchange') return runMerchantChoice();
  if (State.MapId === 'Sea_Of_Fire') { grantSkillExp('Prayer', 6, 'Sea of Fire'); State.say('The Sea of Fire burns away false completion without destroying you.', 620); return true; }
  return false;
};

const clearNextHouseRoom = () => {
  const next = remainingForgettingRooms()[0];
  if (!next) { State.say('The House of Forgetting is already clear. Walk east to the Sea of Fire.', 520); return true; }
  const result = clearForgettingRoom(next.id);
  if (!result.ok) State.say(result.message, 520);
  return true;
};

const runMerchantChoice = () => {
  const offers = merchantOffers();
  const index = (State.Merchant?.refused?.length || 0) + (State.Merchant?.accepted?.length || 0);
  const offer = offers[Math.min(index, offers.length - 1)];
  if (!offer) return false;
  const shouldRefuse = State.Gifts?.declaration?.blockedBy?.length === 0 || (State.Merchant?.accepted?.length || 0) > 0;
  const result = shouldRefuse ? refuseMerchantOffer(offer.id) : acceptMerchantOffer(offer.id);
  State.Story.active = 'Merchant of Exchange';
  State.Story.act = 4;
  State.Story.region = 'Market of Exchange';
  State.Story.objective = shouldRefuse ? 'Refuse the Merchant until gift defeats transaction.' : 'Notice the bargain wound, then repair it.';
  State.Story.nextStep = result.message;
  return true;
};

const practiceTorahRoute = meta => {
  if (handleSpecialMapAction()) return;
  const routes = routeSummary();
  const route = routes[State.Stats.debatesWon % Math.max(1, routes.length)] || 'Mishnah: Judge Favorably';
  State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light + 2);
  grantSkillExp('learning', 3, 'route review');
  const hint = meta.kind === 'road' ? ' Walk east to continue the restoration road.' : '';
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
  if (meta.kind === 'grass' && Math.random() < (meta.wildChance || 0)) startDebate(randomWildEncounter(campaignRegion()));
};

export const handleActionFacing = front => {
  const meta = tileMeta(front.tile);
  if (handleSpecialMapAction()) return;
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
const handlePresenceFacing = (glyph, meta) => { if (canShop(meta)) return runMerchantChoice(); if (shouldBattle(meta)) return startDebate(encounterById(meta.encounter)); openNpcDialogue(glyph, meta); interactQuestIfPresent(meta); };
const handleObjectFacing = meta => { if (meta.book) learnBook(meta.book); else State.say(`${meta.label}: its letters glow softly.`, 360); };
