/**
 * B"H
 * @module MusagDex
 * @description Pokédex-like collection for living Torah concepts.
 *
 * Chapter 170: The Dex learned species, mastery, and evolution. The Awtsmoos
 * has no body and no form, yet every wild Musag now enters a record with its
 * element, weakness, teaching, sweetening count, and evolution name. The player
 * is no longer only winning fights; the player is collecting revealed ideas.
 */
import { State } from '../../binah/State.js';
import { speciesByEncounter } from '../../data/concepts/MusagSpecies.js';

const ensureDex = () => {
  State.MusagDex ||= { found: {}, mastery: {}, species: {}, evolutions: {} };
  State.MusagDex.found ||= {};
  State.MusagDex.mastery ||= {};
  State.MusagDex.species ||= {};
  State.MusagDex.evolutions ||= {};
  return State.MusagDex;
};

export const isMusag = encounter => !!speciesByEncounter(encounter) || !!encounter?.name?.startsWith('Wild Musag');

export const recordMusag = (encounter, win = false) => {
  if (!isMusag(encounter)) return null;
  const dex = ensureDex();
  const species = speciesByEncounter(encounter);
  const id = species?.id || encounter.name.replace('Wild Musag: ', '').toLowerCase().replace(/\s+/g, '_');
  dex.found[id] ||= entryFor(id, encounter, species);
  dex.species[id] = species || dex.species[id] || null;
  dex.found[id].seen += 1;
  dex.found[id].lastFoundMap = State.MapId;
  if (win) sweetenEntry(dex, id, species);
  return dex.found[id];
};

const entryFor = (id, encounter, species) => ({
  id,
  name: species ? `Wild Musag: ${species.name}` : encounter.name,
  glyph: species?.glyph || encounter.glyph,
  element: species?.element || 'Unknown',
  weakTo: species?.weakTo || 'Torah',
  teaching: species?.teaching || encounter.lesson,
  firstFoundMap: State.MapId,
  lastFoundMap: State.MapId,
  seen: 0,
  sweetened: 0,
  lastLesson: encounter.lesson
});

const sweetenEntry = (dex, id, species) => {
  dex.found[id].sweetened += 1;
  dex.mastery[id] = masteryTier(dex.found[id].sweetened);
  if (species && dex.found[id].sweetened >= 3) dex.evolutions[id] = species.evolution;
};

const masteryTier = count => {
  if (count >= 10) return 'gold';
  if (count >= 5) return 'silver';
  if (count >= 2) return 'bronze';
  return 'revealed';
};

export const musagStatBonus = () => {
  const dex = ensureDex();
  return Object.entries(dex.found).reduce((sum, [id, entry]) => {
    const species = dex.species[id];
    const stat = species?.stat || 'daat';
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
    sweetened: entry.sweetened,
    mastery: dex.mastery[entry.id] || 'revealed',
    evolution: dex.evolutions[entry.id] || null
  }));
};

export const dexRows = () => {
  const list = dexSummary();
  if (!list.length) return [['Musag Dex', '0 revealed']];
  return list.slice(0, 6).map(entry => [entry.name, `${entry.mastery} • ${entry.sweetened} sweetened${entry.evolution ? ` → ${entry.evolution}` : ''}`]);
};

export const dexLine = () => {
  const list = dexSummary();
  if (!list.length) return 'Musag Dex: 0 revealed';
  const evolved = list.filter(e => e.evolution).length;
  return `Musag Dex: ${list.length} revealed | Evolved ${evolved}`;
};
