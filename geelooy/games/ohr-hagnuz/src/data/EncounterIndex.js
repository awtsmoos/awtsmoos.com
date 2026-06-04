/**
 * B"H
 * @module EncounterIndex
 * @description Debate encounters are now living Torah concept species.
 *
 * Chapter 171: Wild battles became concept encounters. The Awtsmoos has no body
 * and no form, yet every wild Musag now carries species metadata: element,
 * weakness, collection route, and evolution hint. Trainer battles remain guides;
 * wild battles become collectible Torah ideas.
 */
import { MidgameEncounters, MidgameWildIds } from './EncounterIndexMidgame.js';
import { MusagSpecies } from './concepts/MusagSpecies.js';

const musag = id => {
  const species = MusagSpecies[id];
  return {
    name: `Wild Musag: ${species.name}`,
    glyph: species.glyph,
    light: { helem: 38, tzimtzum: 44, ohr_chozer: 50, safek: 58, nekudah: 48 }[id] || 42,
    lesson: species.teaching,
    speciesId: id,
    element: species.element,
    weakTo: species.weakTo,
    route: species.route,
    kind: 'Living Concept'
  };
};

const CoreEncounters = {
  trainer: { name: 'Melamed Trainer', glyph: 'ר', light: 72, lesson: 'The trainer asks: can you separate claim, proof, and source?', kind: 'Guide' },
  sage: { name: 'Sage of Sources', glyph: 'ס', light: 64, lesson: 'The sage tests whether your answer is rooted in text.', kind: 'Guide' },
  merchant: { name: 'Merchant Scribe', glyph: 'נ', light: 52, lesson: 'The scribe weighs the value of each word.', kind: 'Guide' },
  kabbalist: { name: 'Forest Mekubal', glyph: 'ק', light: 84, lesson: 'A hidden pattern demands ordered vessels.', kind: 'Guide' },
  tzaddik: { name: 'Hidden Tzaddik', glyph: 'צ', light: 96, lesson: 'The tzaddik challenges you to sweeten opposition at its root.', kind: 'Guide' },
  wildHelem: musag('helem'),
  wildTzimtzum: musag('tzimtzum'),
  wildOhrChozer: musag('ohr_chozer'),
  wildSafek: musag('safek'),
  wildNekudah: musag('nekudah')
};

export const EncounterIndex = { ...CoreEncounters, ...MidgameEncounters };
export const WildEncounterIds = ['wildHelem', 'wildTzimtzum', 'wildOhrChozer', 'wildSafek', 'wildNekudah', ...MidgameWildIds];
export const DebateEncounters = { trainer: EncounterIndex.trainer, wild: WildEncounterIds.map(id => EncounterIndex[id]).filter(Boolean) };
export const encounterById = id => EncounterIndex[id] || EncounterIndex.wildHelem;
export const randomWildEncounter = () => encounterById(WildEncounterIds[Math.floor(Math.random() * WildEncounterIds.length)]);
