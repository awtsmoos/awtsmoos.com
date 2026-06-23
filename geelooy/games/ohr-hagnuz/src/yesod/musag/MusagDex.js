/**
 * B"H
 * @module MusagDex
 * @description Pokemon-like discovery, sweetening, mastery, and evolution for living concepts.
 *
 * Chapter 309: The Dex became a beis midrash of creatures. The Awtsmoos
 * creates every concept from nothing every instant, and the player does not
 * catch ideas as property; the player sees, sweetens, masters, evolves, and
 * teaches them until they reveal how the world hangs together.
 */
import { State } from '../../binah/State.js';
import { MusagSpecies, speciesByEncounter } from '../../data/concepts/MusagSpecies.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';

export const ensureDex = () => {
  State.MusagDex ||= { found: {}, mastery: {}, species: {}, evolutions: {}, seenCount: 0, sweetenedCount: 0, masteredCount: 0 };
  State.MusagDex.found ||= {};
  State.MusagDex.mastery ||= {};
  State.MusagDex.species ||= {};
  State.MusagDex.evolutions ||= {};
  recountDex();
  return State.MusagDex;
};

export const speciesIdFor = encounter => {
  if (!encounter) return null;
  if (encounter.speciesId && MusagSpecies[encounter.speciesId]) return encounter.speciesId;
  const species = speciesByEncounter(encounter);
  if (species?.id) return species.id;
  const name = String(encounter.name || '');
  if (!name.startsWith('Wild Musag')) return null;
  return name.replace(/^Wild Musag:\s*/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
};

export const isMusag = encounter => !!speciesIdFor(encounter);

const entryFor = (id, encounter, species) => ({
  id,
  name: species?.name || encounter.name || id,
  glyph: species?.glyph || encounter.glyph || '◇',
  element: species?.element || encounter.element || 'Unknown',
  weakTo: species?.weakness || encounter.weakTo || 'Torah',
  route: species?.route || encounter.route || 'Unknown Route',
  region: species?.region || State.Story?.region || State.MapId,
  teaching: species?.teaching || encounter.lesson || 'A hidden concept asks to be sweetened.',
  skill: species?.skill || 'Learning',
  firstFoundMap: State.MapId,
  lastFoundMap: State.MapId,
  seen: 0,
  sweetened: 0,
  mastered: false,
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
  grantSkillExp(species?.skill || 'Observation', 2, `${dex.found[id].name} seen`);
  if (win) recordMusagVictory(id, species);
  recountDex();
  return dex.found[id];
};

export const recordMusagVictory = (id, species = MusagSpecies[id] || null) => {
  const dex = ensureDex();
  const entry = dex.found[id];
  if (!entry) return null;
  entry.sweetened += 1;
  entry.mastered = entry.sweetened >= 5;
  dex.mastery[id] = entry.mastered ? 'mastered' : masteryTier(entry.sweetened);
  const evolution = species?.evolvesTo || species?.evolution || null;
  if (evolution && entry.sweetened >= 3) dex.evolutions[id] = evolution;
  grantSkillExp(entry.skill || species?.skill || 'Restoration', 8, `${entry.name} sweetened`);
  recountDex();
  return entry;
};

const recountDex = () => {
  const dex = State.MusagDex || {};
  const entries = Object.values(dex.found || {});
  dex.seenCount = entries.length;
  dex.sweetenedCount = entries.reduce((n, e) => n + (e.sweetened || 0), 0);
  dex.masteredCount = entries.filter(e => e.mastered || (e.sweetened || 0) >= 5).length;
};

export const musagStatBonus = () => {
  const dex = ensureDex();
  return Object.entries(dex.found).reduce((sum, [id, entry]) => {
    const stat = dex.species[id]?.skill || 'Learning';
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
    region: entry.region,
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
