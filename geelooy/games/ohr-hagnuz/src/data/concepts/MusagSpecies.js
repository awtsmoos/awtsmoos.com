/**
 * B"H
 * @module MusagSpecies
 * @description Collectible Torah concept species: the Musag Dex spine.
 *
 * Chapter 166: The monsters confessed they were ideas wearing masks. The
 * Awtsmoos has no body and no form, yet the player can meet Helem, Tzimtzum,
 * Ohr Chozer, Safek, and Nekudah as living species: each has element, route
 * weakness, mastery rewards, and an evolution teaching unlocked by sweetening.
 */
export const MusagSpecies = {
  helem: {
    id: 'helem', name: 'Helem', glyph: 'מ', element: 'Concealment', weakTo: 'Mishnah',
    route: 'Pirkei Avos', evolution: 'Gilui', color: '#8e5cf4', stat: 'binah',
    teaching: 'Hiddenness is not absence; it is a vessel asking to be opened.'
  },
  tzimtzum: {
    id: 'tzimtzum', name: 'Tzimtzum', glyph: 'ם', element: 'Boundary', weakTo: 'Kabbalah',
    route: 'Tzimtzum', evolution: 'Kav', color: '#ff8a80', stat: 'chochmah',
    teaching: 'Contraction makes room for relationship.'
  },
  ohr_chozer: {
    id: 'ohr_chozer', name: 'Ohr Chozer', glyph: 'ן', element: 'Return', weakTo: 'Niggun',
    route: 'Ohr Chozer', evolution: 'Keter Echo', color: '#fff176', stat: 'daat',
    teaching: 'The answer from below awakens a higher crown.'
  },
  safek: {
    id: 'safek', name: 'Safek', glyph: 'ס', element: 'Doubt', weakTo: 'Chassidus',
    route: 'Tanya', evolution: 'Birur', color: '#80d8ff', stat: 'daat',
    teaching: 'Doubt sweetened becomes a sharper vessel of daat.'
  },
  nekudah: {
    id: 'nekudah', name: 'Nekudah', glyph: 'נ', element: 'Point', weakTo: 'Mishnah',
    route: 'Berakhot', evolution: 'Partzuf', color: '#c7f59a', stat: 'chochmah',
    teaching: 'A point of truth expands into a structured face.'
  }
};

export const speciesByName = name => {
  const clean = String(name || '').replace(/^Wild Musag:\s*/i, '').toLowerCase().replace(/\s+/g, '_');
  return MusagSpecies[clean] || null;
};

export const speciesByEncounter = encounter => speciesByName(encounter?.name);
export const musagSpeciesList = () => Object.values(MusagSpecies);
