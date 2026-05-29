/**
 * B"H
 * @module OhrEncounter
 *
 * Chapter 2: The Gate That Refused to Echo Itself.
 *
 * The Awtsmoos, beyond body and form, renews every arrival tile from nothing:
 * door, grass, book, synagogue, mitzvah, NPC, and hidden quest-spark. This
 * module keeps that arrival-order clear, so a book is learned once, a holy
 * place heals once, and no duplicate import declares the same vessel twice.
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

/**
 * Tells the story bound to an encountered glyph.
 *
 * @param {string} glyph - Tile glyph whose letters are being encountered.
 * @param {{ label?: string }} meta - Tile metadata with display label.
 * @returns {void}
 */
const maybeStory = (glyph, meta) => tellStory(glyph, meta.label || 'NPC');

/**
 * Runs a quest interaction before the ordinary tile reward when present.
 *
 * @param {object} meta - Tile metadata that may carry a quest marker.
 * @returns {void}
 */
const interactQuestIfPresent = (meta) => {
  if (meta.quest) interactQuest(meta);
};

/**
 * Handles arrival on a book tile.
 *
 * @param {object} meta - Tile metadata containing a book id.
 * @returns {boolean} Whether this handler consumed the arrival.
 */
const handleBookArrival = (meta) => {
  if (!meta.book) return false;
  interactQuestIfPresent(meta);
  learnBook(meta.book);
  return true;
};

/**
 * Handles arrival on a synagogue tile.
 *
 * @param {object} meta - Tile metadata for the holy healing place.
 * @returns {boolean} Whether this handler consumed the arrival.
 */
const handleSynagogueArrival = (meta) => {
  if (meta.kind !== 'synagogue') return false;
  interactQuestIfPresent(meta);
  healAtSynagogue(meta.label);
  return true;
};

/**
 * Handles arrival on a mitzvah tile.
 *
 * @param {object} meta - Tile metadata describing the mitzvah action.
 * @returns {boolean} Whether this handler consumed the arrival.
 */
const handleMitzvahArrival = (meta) => {
  if (meta.kind !== 'mitzvah') return false;
  doMitzvah(meta.label);
  return true;
};

/**
 * Handles arrival on a portal tile.
 *
 * @param {string} glyph - Actual tile glyph under the hero.
 * @param {object} meta - Tile metadata describing door or edge behavior.
 * @returns {boolean} Whether this handler consumed the arrival.
 */
const handlePortalArrival = (glyph, meta) => {
  if (meta.kind !== 'door' && meta.kind !== 'edge') return false;
  const portal = portalAt(State.Hero.cx, State.Hero.cy, glyph);
  if (portal) transfer(portal);
  return true;
};

/**
 * Handles arrival on a speaking or debating presence.
 *
 * @param {string} glyph - Tile glyph of the presence.
 * @param {object} meta - Tile metadata for story, quest, and encounter.
 * @returns {boolean} Whether this handler consumed the arrival.
 */
const handlePresenceArrival = (glyph, meta) => {
  if (meta.kind !== 'npc' && meta.kind !== 'musag') return false;
  if (meta.quest) {
    maybeStory(glyph, meta);
    interactQuest(meta);
  }
  if (meta.encounter) startDebate(encounterById(meta.encounter));
  return true;
};

/**
 * Responds to the hero stepping onto the current tile.
 *
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
 * Responds to the action button against the tile in front of the hero.
 *
 * @param {{ tile: string, x: number, y: number }} front - Facing tile data.
 * @returns {void}
 */
export const handleActionFacing = (front) => {
  const meta = tileMeta(front.tile);

  if (meta.quest || meta.questItem) {
    maybeStory(front.tile, meta);
    interactQuest(meta);
    return;
  }

  if (meta.kind === 'door') {
    const portal = portalAt(front.x, front.y, front.tile);
    if (portal) transfer(portal);
  } else if (meta.kind === 'npc' || meta.kind === 'musag') {
    maybeStory(front.tile, meta);
    if (meta.encounter) startDebate(encounterById(meta.encounter));
  } else if (meta.kind === 'object') {
    if (meta.book) learnBook(meta.book);
    else State.say(`${meta.label}: its letters glow softly.`, 360);
  } else if (meta.kind === 'synagogue') {
    healAtSynagogue(meta.label);
  } else if (meta.kind === 'mitzvah') {
    doMitzvah(meta.label);
  }
};
