/** B"H @module EncounterIndex */
import { MidgameEncounters, MidgameWildIds } from './EncounterIndexMidgame.js';
import { RambamEncounters, RambamWildIds } from './EncounterIndexRambam.js';
import { MusagSpecies } from './concepts/MusagSpecies.js';
const musag = id => { const s = MusagSpecies[id]; return { name: `Wild Musag: ${s.name}`, glyph: s.glyph, light: { helem: 38, tzimtzum: 44, ohr_chozer: 50, safek: 58, nekudah: 48, netinah: 72, seder: 76, bikkurim: 84 }[id] || 42, lesson: s.teaching, speciesId: id, element: s.element, weakTo: s.weakTo, route: s.route, kind: 'Living Concept' }; };
const CoreEncounters = {
  trainer: { name: 'Melamed Trainer', glyph: 'ר', light: 72, lesson: 'Can you separate claim, proof, and source?', kind: 'Guide' },
  sage: { name: 'Sage of Sources', glyph: 'ס', light: 64, lesson: 'Is your answer rooted in text?', kind: 'Guide' },
  merchant: { name: 'Merchant Scribe', glyph: 'נ', light: 52, lesson: 'Each word must be weighed.', kind: 'Guide' },
  kabbalist: { name: 'Forest Mekubal', glyph: 'ק', light: 84, lesson: 'A hidden pattern demands ordered vessels.', kind: 'Guide' },
  tzaddik: { name: 'Hidden Tzaddik', glyph: 'צ', light: 96, lesson: 'Sweeten opposition at its root.', kind: 'Guide' },
  wildHelem: musag('helem'), wildTzimtzum: musag('tzimtzum'), wildOhrChozer: musag('ohr_chozer'), wildSafek: musag('safek'), wildNekudah: musag('nekudah'),
  wildNetinah: musag('netinah'), wildSeder: musag('seder'), wildBikkurim: musag('bikkurim')
};
export const EncounterIndex = { ...CoreEncounters, ...RambamEncounters, ...MidgameEncounters };
export const WildEncounterIds = ['wildHelem', 'wildTzimtzum', 'wildOhrChozer', 'wildSafek', 'wildNekudah', 'wildNetinah', 'wildSeder', 'wildBikkurim', ...RambamWildIds, ...MidgameWildIds];
export const DebateEncounters = { trainer: EncounterIndex.trainer, wild: WildEncounterIds.map(id => EncounterIndex[id]).filter(Boolean) };
export const encounterById = id => EncounterIndex[id] || EncounterIndex.wildHelem;
export const randomWildEncounter = () => encounterById(WildEncounterIds[Math.floor(Math.random() * WildEncounterIds.length)]);
