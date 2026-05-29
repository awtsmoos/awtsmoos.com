/**
 * B"H
 * @module TileLexicon
 * Every active thing is a glyph with a tiny rule record.
 */
import { MidgameTiles } from './TileLexiconMidgame.js';
const CoreTiles = {
  '0': { kind: 'floor', pass: true, ground: '.' },
  '1': { kind: 'grass', pass: true, ground: '1', wildChance: 0.08 },
  '2': { kind: 'road', pass: true, ground: '2' },
  'W': { kind: 'wall', pass: false, ground: '.', solid: true },
  'T': { kind: 'tree', pass: false, ground: '1', solid: true },

  'ד': { kind: 'door', pass: true, ground: '2', label: 'Home Door' },
  'ה': { kind: 'door', pass: true, ground: '2', label: 'Beis Midrash Door' },
  'ו': { kind: 'door', pass: true, ground: '2', label: 'Sod Cave Gate' },
  'ז': { kind: 'door', pass: true, ground: '2', label: 'Garden Gate' },
  'ח': { kind: 'door', pass: true, ground: '2', label: 'Academy Gate' },

  '↑': { kind: 'edge', pass: true, ground: '2', edge: 'N' },
  '↓': { kind: 'edge', pass: true, ground: '2', edge: 'S' },
  '→': { kind: 'edge', pass: true, ground: '2', edge: 'E' },
  '←': { kind: 'edge', pass: true, ground: '2', edge: 'W' },

  'ר': { kind: 'npc', pass: true, ground: '2', encounter: 'trainer', label: 'Melamed Trainer' },
  'ס': { kind: 'npc', pass: true, ground: '2', encounter: 'sage', quest: 'sources', label: 'Sage of Sources' },
  'נ': { kind: 'npc', pass: true, ground: '2', encounter: 'merchant', quest: 'market_words', label: 'Merchant Scribe' },
  'ק': { kind: 'npc', pass: true, ground: '1', encounter: 'kabbalist', quest: 'cave_sod', label: 'Forest Mekubal' },
  'צ': { kind: 'npc', pass: true, ground: '1', encounter: 'tzaddik', quest: 'hidden_tzaddik', label: 'Hidden Tzaddik' },
  'ג': { kind: 'npc', pass: true, ground: '2', quest: 'first_light', label: 'Village Guide' },
  'ש': { kind: 'npc', pass: true, ground: '1', quest: 'garden_sparks', label: 'Garden Shepherd' },
  'י': { kind: 'npc', pass: true, ground: '2', quest: 'river_crossing', label: 'River Gatekeeper' },

  'מ': { kind: 'musag', pass: true, ground: '1', encounter: 'wildHelem', label: 'Wild Helem' },
  'ם': { kind: 'musag', pass: true, ground: '1', encounter: 'wildTzimtzum', label: 'Wild Tzimtzum' },
  'ן': { kind: 'musag', pass: true, ground: '1', encounter: 'wildOhrChozer', label: 'Wild Ohr Chozer' },

  'ב': { kind: 'object', pass: true, ground: '.', book: 'mishnahSeeds', quest: 'sefarim_path', label: 'Sefer Stand' },
  'ע': { kind: 'object', pass: true, ground: '.', book: 'TanyaFlame', label: 'Etz Chaim Table' },
  'ל': { kind: 'object', pass: true, ground: '.', book: 'ZoharLamp', label: 'Luminous Lamp' },
  'א': { kind: 'object', pass: true, ground: '1', questItem: 'spark', label: 'Hidden Spark' },
  'פ': { kind: 'object', pass: true, ground: '.', questItem: 'scroll', label: 'Lost Parchment' },
  'ת': { kind: 'object', pass: true, ground: '.', questItem: 'chest', label: 'Locked Teivah' },
  '⌂': { kind: 'synagogue', pass: true, ground: '2', quest: 'village_minyan', label: 'Small Synagogue' },
  '✡': { kind: 'mitzvah', pass: true, ground: '2', label: 'Mitzvah Station' }
};

export const TileLexicon = { ...CoreTiles, ...MidgameTiles };

// FIX: Safe fallback that always returns a valid object, never undefined
export const tileMeta = (glyph) => TileLexicon[glyph] || { kind: 'floor', pass: true, ground: '.' };
export const isPassableGlyph = (glyph) => !!tileMeta(glyph).pass;
export const groundGlyph = (glyph) => tileMeta(glyph).ground || glyph;
export const isDoorGlyph = (glyph) => tileMeta(glyph).kind === 'door';
export const isEdgeGlyph = (glyph) => tileMeta(glyph).kind === 'edge';
export const isEncounterGlyph = (glyph) => ['npc', 'musag'].includes(tileMeta(glyph).kind);
export const isObjectGlyph = (glyph) => tileMeta(glyph).kind === 'object';
