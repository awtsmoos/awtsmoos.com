/**
 * B"H
 * @module MusagDex
 * @description Pokemon-like collection, mastery, and evolution for living concepts.
 *
 * Chapter 209: The monsters admitted they were thoughts asking for tikkun. The
 * Awtsmoos has no body and no form, yet every wild Musag now enters the Dex,
 * gains mastery through repeated sweetening, and reveals an evolution teaching
 * when the player returns to the same idea with patience instead of conquest.
 */
import { State } from '../../binah/State.js';
import { MusagSpecies, speciesByEncounter } from '../../data/concepts/MusagSpecies.js';

export const ensureDex = () => {
  State.MusagDex ||= { found: {}, mastery: {}, species: {}, evolutions: {} };
  State.MusagDex.found ||= {};
  State.MusagDex.mastery ||= {};
  State.MusagDex.species ||= {};
  State.MusagDex.evolutions ||= {};
  return State.MusagDex;
};

export const speciesIdFor = encounter => {
  if (!encounter) return null;
  if (encounter.speciesId && MusagSpecies[encounter.speciesId]) return encounter.speciesId;
  const species = speciesByEncounter(encounter);
  if (species?.id) return species.id;
  if (!String(encounter.name || '').startsWith('Wild Musag')) return null;
  return String(encounter.name).replace(/^Wild Musag:\s*/i, '').toLowerCase().replace(/\s+/g, '_');
};

export const isMusag = encounter => !!speciesIdFor(encounter);

const entryFor = (id, encounter, species) => ({
  id,
  name: species ? `Wild Musag: ${species.name}` : encounter.name,
  glyph: species?.glyph || encounter.glyph || '?',
  element: species?.element || encounter.element || 'Unknown',
  weakTo: species?.weakTo || encounter.weakTo || 'Torah',
  route: species?.route || encounter.route || 'Unknown Route',
  teaching: species?.teaching || encounter.lesson || 'A hidden concept asks to be sweetened.',
  firstFoundMap: State.MapId,
  lastFoundMap: State.MapId,
  seen: 0,
  sweetened: 0,
  lastLesson: encounter.lesson || species?.teaching || ''
});

export const masteryTier = count => {
  if (count >= 10) return 'gold';
  if (count >= 5) return 'silver';
  if (count >= 2) return 'bronze';
  return 'revealed';
};

export const discoverMusag = encounter => recordMusag(encounter, false);

export const recordMusag = (encounter, win = false) => {
  const id = speciesIdFor(encounter);
  if (!id) return null;
  const dex = ensureDex();
  const species = MusagSpecies[id] || speciesByEncounter(encounter) || null;
  dex.found[id] ||= entryFor(id, encounter, species);
  dex.species[id] = species;
  dex.found[id].seen += 1;
  dex.found[id].lastFoundMap = State.MapId;
  dex.found[id].lastLesson = encounter.lesson || dex.found[id].lastLesson;
  if (win) recordMusagVictory(id, species);
  return dex.found[id];
};

export const recordMusagVictory = (id, species = MusagSpecies[id] || null) => {
  const dex = ensureDex();
  const entry = dex.found[id];
  if (!entry) return null;
  entry.sweetened += 1;
  dex.mastery[id] = masteryTier(entry.sweetened);
  if (species && entry.sweetened >= 3) dex.evolutions[id] = species.evolution;
  return entry;
};

export const musagStatBonus = () => {
  const dex = ensureDex();
  return Object.entries(dex.found).reduce((sum, [id, entry]) => {
    const stat = dex.species[id]?.stat || 'daat';
    sum[stat] = (sum[stat] || 0) + Math.floor((entry.sweetened || 0) / 2);
    return sum;
  }, {});
};

export const dexSummary = () => {
  const dex = ensureDex();
  return Object.values(dex.found).map(entry => ({
    id: entry.id,
    name: entry.name,
    glyph: entry.glyph,
    element: entry.element,
    weakTo: entry.weakTo,
    route: entry.route,
    sweetened: entry.sweetened,
    seen: entry.seen,
    mastery: dex.mastery[entry.id] || 'revealed',
    evolution: dex.evolutions[entry.id] || null,
    teaching: entry.teaching
  })).sort((a, b) => b.sweetened - a.sweetened || a.name.localeCompare(b.name));
};

export const dexRows = () => {
  const list = dexSummary();
  if (!list.length) return [['Musag Dex', '0 revealed']];
  return list.slice(0, 8).map(e => [e.name, `${e.mastery} • seen ${e.seen} • sweetened ${e.sweetened}${e.evolution ? ` → ${e.evolution}` : ''}`]);
};

export const dexLine = () => {
  const list = dexSummary();
  if (!list.length) return 'Musag Dex: 0 revealed';
  return `Musag Dex: ${list.length} revealed | ${list.filter(e => e.evolution).length} evolved`;
};
