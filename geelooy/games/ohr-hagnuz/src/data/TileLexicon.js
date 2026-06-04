/**
 * B"H
 * @module TileLexicon
 * @description Glyph roles for every NPC, object, door, musag, and story guide.
 *
 * Chapter 184: The letters became a cast list. The Awtsmoos has no body and no
 * form, yet every person in the player's road now has a role: talker, merchant,
 * trainer, challenger, healer, guardian, dream-walker, middah guide, shadow,
 * or final soul-root. No guide should become a battle unless marked battle=true.
 */
import { MidgameTiles } from './TileLexiconMidgame.js';

const npc = (label, extra = {}) => ({ kind: 'npc', pass: true, ground: '2', label, role: 'guide', dialogueOnly: true, ...extra });
const grassNpc = (label, extra = {}) => ({ kind: 'npc', pass: true, ground: '1', label, role: 'guide', dialogueOnly: true, ...extra });
const fightNpc = (label, encounter = 'trainer', extra = {}) => ({ kind: 'npc', pass: true, ground: '2', label, role: 'trainer', encounter, battle: true, ...extra });
const obj = (label, extra = {}) => ({ kind: 'object', pass: true, ground: '.', label, ...extra });

const CoreTiles = {
  '0': { kind: 'floor', pass: true, ground: '.' }, '1': { kind: 'grass', pass: true, ground: '1', wildChance: 0.055 }, '2': { kind: 'road', pass: true, ground: '2' },
  'W': { kind: 'wall', pass: false, ground: '.', solid: true }, 'T': { kind: 'tree', pass: false, ground: '1', solid: true },
  'ד': { kind: 'door', pass: true, ground: '2', label: 'Home Door' }, 'ה': { kind: 'door', pass: true, ground: '2', label: 'Beis Midrash Door' },
  'ו': { kind: 'door', pass: true, ground: '2', label: 'Sod Cave Gate' }, 'ז': { kind: 'door', pass: true, ground: '2', label: 'Garden Gate' }, 'ח': { kind: 'door', pass: true, ground: '2', label: 'Academy Gate' },
  '↑': { kind: 'edge', pass: true, ground: '2', edge: 'N' }, '↓': { kind: 'edge', pass: true, ground: '2', edge: 'S' }, '→': { kind: 'edge', pass: true, ground: '2', edge: 'E' }, '←': { kind: 'edge', pass: true, ground: '2', edge: 'W' },

  'ג': npc('Village Guide', { quest: 'first_light' }), 'נ': npc('Merchant Scribe', { quest: 'market_words', role: 'merchant', shop: 'scribe_shop' }),
  'ס': npc('Sage of Sources', { quest: 'sources' }), 'ש': grassNpc('Garden Shepherd', { quest: 'garden_sparks' }), 'י': npc('River Gatekeeper', { quest: 'river_crossing' }),
  'ק': grassNpc('Forest Mekubal', { quest: 'cave_sod' }), 'צ': grassNpc('Hidden Tzaddik', { quest: 'hidden_tzaddik' }), 'ר': fightNpc('Melamed Trainer', 'trainer', { quest: 'academy_gate' }),

  C: npc('Small Child', { quest: 'child_spark' }), E: npc('Elder Woman of Memory', { quest: 'elder_memory' }), O: npc('The Counter', { quest: 'mishnah_counter' }),
  P: npc('The Repeater', { quest: 'repeater_mishnah' }), F: npc('Forgotten Student', { quest: 'forgotten_student' }), Q: npc('The Asker', { quest: 'asker_questions' }),
  X: fightNpc('The Challenger', 'trainer', { quest: 'challenger_proof' }), U: npc('Proof Bringer', { quest: 'proof_bringer' }), G: npc('Tangent Walker', { quest: 'tangent_return' }),
  D: grassNpc('Dancing Chossid', { quest: 'dancing_chossid' }), H: grassNpc('Broken Chossid', { quest: 'broken_chossid' }), A: grassNpc('Farbrengen Circle', { quest: 'farbrengen_circle' }),
  M: grassNpc('Silent Mekubal', { quest: 'silent_mekubal' }), V: fightNpc('Guardian of Sod', 'kabbalist', { quest: 'guardian_sod' }), Y: grassNpc('Dream Walker', { quest: 'dream_walker' }),
  L: grassNpc('Endless Giver', { quest: 'endless_giver' }), J: fightNpc('The Judge', 'trainer', { quest: 'judge_gevurah' }), Z: grassNpc('The Reconciler', { quest: 'reconciler_tiferes' }),
  K: grassNpc('The Stubborn One', { quest: 'stubborn_netzach' }), I: grassNpc('The Humble One', { quest: 'humble_hod' }), B: grassNpc('The Connector', { quest: 'connector_yesod' }),
  R: grassNpc('The Listener', { quest: 'listener_malchus' }), '?': grassNpc('Shadow Scholar', { quest: 'shadow_scholar' }), '@': grassNpc('Adam HaRishon', { quest: 'adam_harishon' }),

  'מ': { kind: 'musag', pass: true, ground: '1', encounter: 'wildHelem', battle: true, label: 'Wild Helem' },
  'ם': { kind: 'musag', pass: true, ground: '1', encounter: 'wildTzimtzum', battle: true, label: 'Wild Tzimtzum' },
  'ן': { kind: 'musag', pass: true, ground: '1', encounter: 'wildOhrChozer', battle: true, label: 'Wild Ohr Chozer' },
  'ב': obj('Sefer Stand', { book: 'mishnahSeeds', quest: 'sefarim_path' }), 'ע': obj('Etz Chaim Table', { book: 'TanyaFlame' }), 'ל': obj('Luminous Lamp', { book: 'ZoharLamp' }),
  'א': { kind: 'object', pass: true, ground: '1', questItem: 'spark', label: 'Hidden Spark' }, 'פ': obj('Lost Parchment', { questItem: 'scroll' }), 'ת': obj('Locked Teivah', { questItem: 'chest' }),
  '⌂': { kind: 'synagogue', pass: true, ground: '2', quest: 'village_minyan', label: 'Small Synagogue' }, '✡': { kind: 'mitzvah', pass: true, ground: '2', label: 'Mitzvah Station' }
};

export const TileLexicon = { ...CoreTiles, ...MidgameTiles };
export const tileMeta = glyph => TileLexicon[glyph] || { kind: 'floor', pass: true, ground: '.' };
export const isPassableGlyph = glyph => !!tileMeta(glyph).pass;
export const groundGlyph = glyph => tileMeta(glyph).ground || glyph;
export const isDoorGlyph = glyph => tileMeta(glyph).kind === 'door';
export const isEdgeGlyph = glyph => tileMeta(glyph).kind === 'edge';
export const isEncounterGlyph = glyph => ['npc', 'musag'].includes(tileMeta(glyph).kind);
export const isObjectGlyph = glyph => tileMeta(glyph).kind === 'object';
