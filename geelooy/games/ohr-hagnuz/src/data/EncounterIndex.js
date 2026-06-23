/**
 * B"H
 * @module EncounterIndex
 * @description Encounter registry for guides, bosses, and all Musag species.
 *
 * Chapter 310: The grass stopped repeating the same small handful of sparks.
 * The Awtsmoos creates every encounter from nothing every instant, and now the
 * road may reveal any living concept whose region, route, weakness, teaching,
 * and evolution belong to the player's current restoration arc.
 */
import { MidgameEncounters } from './EncounterIndexMidgame.js';
import { RambamEncounters } from './EncounterIndexRambam.js';
import { MusagSpecies, allMusagSpecies, musagByRegion } from './concepts/MusagSpecies.js';

const lightByStage = musag => 36 + Math.min(70, (musag.evolvesTo ? 10 : 18) + String(musag.region || '').length + String(musag.route || '').length);
const wildId = id => `wild_${id}`;

const musagEncounter = musag => ({
  name: `Wild Musag: ${musag.name}`,
  glyph: '◇',
  light: lightByStage(musag),
  lesson: musag.teaching,
  speciesId: musag.id,
  element: musag.element,
  weakTo: musag.weakness,
  route: musag.route,
  region: musag.region,
  skill: musag.skill,
  kind: 'Living Concept'
});

const CoreEncounters = {
  trainer: { name: 'Melamed Trainer', glyph: 'ר', light: 72, lesson: 'Can you separate claim, proof, and source?', kind: 'Guide', weakTo: 'Mishnah', element: 'Learning' },
  sage: { name: 'Sage of Sources', glyph: 'ס', light: 64, lesson: 'Is your answer rooted in text?', kind: 'Guide', weakTo: 'Gemara', element: 'Source' },
  merchant: { name: 'Merchant Scribe', glyph: 'נ', light: 52, lesson: 'Each word must be weighed.', kind: 'Guide', weakTo: 'Rambam', element: 'Exchange' },
  kabbalist: { name: 'Forest Mekubal', glyph: 'ק', light: 84, lesson: 'A hidden pattern demands ordered vessels.', kind: 'Guide', weakTo: 'Kabbalah', element: 'Concealment' },
  tzaddik: { name: 'Hidden Tzaddik', glyph: 'צ', light: 96, lesson: 'Sweeten opposition at its root.', kind: 'Guide', weakTo: 'Chassidus', element: 'Restoration' }
};

const MusagEncounters = Object.fromEntries(allMusagSpecies().map(musag => [wildId(musag.id), musagEncounter(musag)]));

export const EncounterIndex = { ...CoreEncounters, ...RambamEncounters, ...MidgameEncounters, ...MusagEncounters };
export const WildEncounterIds = Object.keys(MusagEncounters);
export const DebateEncounters = { trainer: EncounterIndex.trainer, wild: WildEncounterIds.map(id => EncounterIndex[id]).filter(Boolean) };
export const encounterById = id => EncounterIndex[id] || EncounterIndex.wild_helem || EncounterIndex.trainer;
export const wildIdsForRegion = region => musagByRegion(region).map(musag => wildId(musag.id)).filter(id => EncounterIndex[id]);
export const randomWildEncounter = region => {
  const regionIds = region ? wildIdsForRegion(region) : [];
  const ids = regionIds.length ? regionIds : WildEncounterIds;
  return encounterById(ids[Math.floor(Math.random() * ids.length)]);
};
export const encounterFromSpecies = id => EncounterIndex[wildId(id)] || musagEncounter(MusagSpecies[id]);
