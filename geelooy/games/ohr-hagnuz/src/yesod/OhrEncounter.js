/**
 * B"H
 * @module OhrEncounter
 *
 * Chapter 79: No button returned empty-handed.
 * The Awtsmoos, beyond body and form, renews every facing tile from nothing:
 * door, grass, book, synagogue, mitzvah, NPC, musag, and ordinary road. This
 * module makes Talk and Interact always answer, so the player never wonders if
 * the living world heard his hand.
 */
import { State } from '../binah/State.js';
import { tileMeta } from '../data/WorldData.js';
import { encounterById, randomWildEncounter } from '../data/EncounterIndex.js';
import { tileAt, portalAt, transfer } from './OhrWorld.js';
import { startDebate } from './OhrDebate.js';
import { interactQuest } from './OhrQuest.js';
import { tellStory } from './story/OhrStory.js';
import { learnBook } from './books/TorahBooks.js';
import { doMitzvah, healAtSynagogue } from './holy/HolyPlaces.js';

const maybeStory = (glyph, meta) => tellStory(glyph, meta.label || 'NPC');

const interactQuestIfPresent = meta => {
  if (meta.quest) interactQuest(meta);
};

const handleBookArrival = meta => {
  if (!meta.book) return false;
  interactQuestIfPresent(meta);
  learnBook(meta.book);
  return true;
};

const handleSynagogueArrival = meta => {
  if (meta.kind !== 'synagogue') return false;
  interactQuestIfPresent(meta);
  healAtSynagogue(meta.label);
  return true;
};

const handleMitzvahArrival = meta => {
  if (meta.kind !== 'mitzvah') return false;
  doMitzvah(meta.label);
  return true;
};

const handlePortalArrival = (glyph, meta) => {
  if (meta.kind !== 'door' && meta.kind !== 'edge') return false;
  const portal = portalAt(State.Hero.cx, State.Hero.cy, glyph);
  if (portal) transfer(portal);
  return true;
};

const handlePresenceArrival = (glyph, meta) => {
  if (meta.kind !== 'npc' && meta.kind !== 'musag') return false;
  if (meta.quest) {
    maybeStory(glyph, meta);
    interactQuest(meta);
  }
  if (meta.encounter) startDebate(encounterById(meta.encounter));
  return true;
};

const describeQuietTile = meta => {
  const labels = {
    grass: 'The grass rustles. Face a person, door, spark, book, or mitzvah station, then press Talk or Interact.',
    road: 'The road waits. The Village Guide beside the starting road begins the story.',
    floor: 'The room is quiet. Step toward a sefer or doorway and press Interact.',
    tree: 'The tree is solid and silent. Walk around it.'
  };
  State.say(labels[meta.kind] || 'Nothing responds here yet. Face a glowing vessel and try again.', 220);
};

/**
 * B"H
 * @description Responds to the hero stepping onto the current tile.
 * @returns {void}
 */
export const handleArrival = () => {
  const glyph = tileAt(State.Hero.cx, State.Hero.cy);
  const meta = tileMeta(glyph);

  if (handlePortalArrival(glyph, meta)) return;
  if (handleBookArrival(meta)) return;
  if (handleSynagogueArrival(meta)) return;
  if (handleMitzvahArrival(meta)) return;

  if (meta.questItem) {
    interactQuest(meta);
    return;
  }

  if (handlePresenceArrival(glyph, meta)) return;

  if (meta.kind === 'grass' && Math.random() < (meta.wildChance || 0)) {
    startDebate(randomWildEncounter());
  }
};

/**
 * B"H
 * @description Responds to Talk or Interact against the tile in front.
 * @param {{ tile: string, x: number, y: number }} front Facing tile data.
 * @returns {void}
 */
export const handleActionFacing = front => {
  const meta = tileMeta(front.tile);

  if (meta.quest || meta.questItem) {
    maybeStory(front.tile, meta);
    interactQuest(meta);
    return;
  }

  if (meta.kind === 'door') {
    const portal = portalAt(front.x, front.y, front.tile);
    if (portal) transfer(portal);
    else State.say(`${meta.label || 'Door'} is closed for now.`, 220);
    return;
  }

  if (meta.kind === 'npc' || meta.kind === 'musag') {
    maybeStory(front.tile, meta);
    if (meta.encounter) startDebate(encounterById(meta.encounter));
    return;
  }

  if (meta.kind === 'object') {
    if (meta.book) learnBook(meta.book);
    else State.say(`${meta.label}: its letters glow softly.`, 360);
    return;
  }

  if (meta.kind === 'synagogue') {
    healAtSynagogue(meta.label);
    return;
  }

  if (meta.kind === 'mitzvah') {
    doMitzvah(meta.label);
    return;
  }

  describeQuietTile(meta);
};
