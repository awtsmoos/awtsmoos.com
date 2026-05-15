/** B"H * @module EncounterIndex */
import { MidgameEncounters, MidgameWildIds } from './EncounterIndexMidgame.js';

const CoreEncounters = {
  trainer: { name: 'Melamed Trainer', glyph: 'ר', light: 72, lesson: 'The trainer asks: can you separate claim, proof, and source?' },
  sage: { name: 'Sage of Sources', glyph: 'ס', light: 64, lesson: 'The sage tests whether your answer is rooted in text.' },
  merchant: { name: 'Merchant Scribe', glyph: 'נ', light: 52, lesson: 'The scribe weighs the value of each word.' },
  kabbalist: { name: 'Forest Mekubal', glyph: 'ק', light: 84, lesson: 'A hidden pattern demands ordered vessels.' },
  tzaddik: { name: 'Hidden Tzaddik', glyph: 'צ', light: 96, lesson: 'The tzaddik challenges you to sweeten opposition at its root.' },
  wildHelem: { name: 'Wild Musag: Helem', glyph: 'מ', light: 38, lesson: 'A hidden concept rises from the grass.' },
  wildTzimtzum: { name: 'Wild Musag: Tzimtzum', glyph: 'ם', light: 44, lesson: 'The grass contracts into a sharp question.' },
  wildOhrChozer: { name: 'Wild Musag: Ohr Chozer', glyph: 'ן', light: 50, lesson: 'A returning light asks to be understood.' }
};

export const EncounterIndex = { ...CoreEncounters, ...MidgameEncounters };
export const WildEncounterIds = ['wildHelem', 'wildTzimtzum', 'wildOhrChozer', ...MidgameWildIds];

export const DebateEncounters = {
  trainer: EncounterIndex.trainer,
  wild: WildEncounterIds.map(id => EncounterIndex[id])
};

export const encounterById = (id) => EncounterIndex[id] || EncounterIndex.wildHelem;
export const randomWildEncounter = () => encounterById(WildEncounterIds[Math.floor(Math.random() * WildEncounterIds.length)]);
