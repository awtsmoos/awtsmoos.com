/**
 * B"H
 * @module OhrEncounter
 * Arrival and facing-interaction rules.
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
import { learnBook } from './books/TorahBooks.js';
import { doMitzvah, healAtSynagogue } from './holy/HolyPlaces.js';

const maybeStory = (glyph, meta) => tellStory(glyph, meta.label || 'NPC');

export const handleArrival = () => {
  const glyph = tileAt(State.Hero.cx, State.Hero.cy);
  const meta = tileMeta(glyph);

  if (meta.kind === 'door' || meta.kind === 'edge') {
    const portal = portalAt(State.Hero.cx, State.Hero.cy, glyph);
    if (portal) transfer(portal);
    return;
  }

  if (meta.book) {
    if (meta.quest) interactQuest(meta);
    learnBook(meta.book);
    return;
  }

  if (meta.kind === 'synagogue') {
    if (meta.quest) interactQuest(meta);
    healAtSynagogue(meta.label);
    return;
  }

  if (meta.kind === 'mitzvah') {
    doMitzvah(meta.label);
    return;
  }

  if (meta.book) {
    if (meta.quest) interactQuest(meta);
    learnBook(meta.book);
    return;
  }

  if (meta.kind === 'synagogue') {
    if (meta.quest) interactQuest(meta);
    healAtSynagogue(meta.label);
    return;
  }

  if (meta.kind === 'mitzvah') {
    doMitzvah(meta.label);
    return;
  }

  if (meta.questItem) {
    interactQuest(meta);
    return;
  }

  if (meta.kind === 'npc' || meta.kind === 'musag') {
    if (meta.quest) {
      maybeStory(glyph, meta);
      interactQuest(meta);
    }
    if (meta.encounter) startDebate(encounterById(meta.encounter));
    return;
  }

  if (meta.kind === 'grass' && Math.random() < (meta.wildChance || 0)) {
    startDebate(randomWildEncounter());
  }
};

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
