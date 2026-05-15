/**
 * B"H
 * @module MusagDex
 * Pokedex-like collection, but the creatures are concepts that get revealed and sweetened.
 */
import { State } from '../../binah/State.js';

const ensureDex = () => {
  State.MusagDex ||= { found: {}, mastery: {} };
  State.MusagDex.found ||= {};
  State.MusagDex.mastery ||= {};
  return State.MusagDex;
};

export const isMusag = (encounter) => !!encounter?.name?.startsWith('Wild Musag');

export const recordMusag = (encounter, win = false) => {
  if (!isMusag(encounter)) return null;
  const dex = ensureDex();
  const id = encounter.name.replace('Wild Musag: ', '').toLowerCase().replace(/\s+/g, '_');
  dex.found[id] ||= {
    id,
    name: encounter.name,
    glyph: encounter.glyph,
    firstFoundMap: State.MapId,
    sweetened: 0,
    lastLesson: encounter.lesson
  };
  if (win) {
    dex.found[id].sweetened += 1;
    dex.mastery[id] = masteryTier(dex.found[id].sweetened);
  }
  return dex.found[id];
};

const masteryTier = (count) => {
  if (count >= 10) return 'gold';
  if (count >= 5) return 'silver';
  if (count >= 2) return 'bronze';
  return 'revealed';
};

export const dexSummary = () => {
  const dex = ensureDex();
  return Object.values(dex.found).map(entry => ({
    id: entry.id,
    name: entry.name,
    glyph: entry.glyph,
    sweetened: entry.sweetened,
    mastery: dex.mastery[entry.id] || 'revealed'
  }));
};

export const dexLine = () => {
  const list = dexSummary();
  if (!list.length) return 'Musag Dex: 0 revealed';
  const gold = list.filter(e => e.mastery === 'gold').length;
  return `Musag Dex: ${list.length} revealed | Gold ${gold}`;
};
