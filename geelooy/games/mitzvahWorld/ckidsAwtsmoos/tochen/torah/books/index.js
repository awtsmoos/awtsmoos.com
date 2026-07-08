/**
 * B"H
 * @file index.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MASTER LIBRARY OF LIGHT — Torah Passage Registry                ║
 * ║                                                                      ║
 * ║  Aggregates ALL modular Torah books into one holy registry.          ║
 * ║  Every passage is a vessel of infinite light, organized by:          ║
 * ║    - TIER: Common, Uncommon, Rare, Legendary                         ║
 * ║    - TYPE: Ground/Water/Fire/Air (Pshat/Remez/Drush/Sod)            ║
 * ║    - BOOK: Chumash, Pirkei Avos, Tanya, Gemara, Rebbe's Pesukim     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { PIRKEI_AVOS_PASSAGES } from './pirkeiAvos.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { REBBE_12_PESUKIM } from './rebbesPesakim.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { TANYA_PASSAGES } from './tanyaPassages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GEMARA_PASSAGES } from './gemaraPassages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

// ─── MASTER FLAT REGISTRY ────────────────────────────────────────────────────
export const ALL_PASSAGES = [
    ...PIRKEI_AVOS_PASSAGES,
    ...REBBE_12_PESUKIM,
    ...TANYA_PASSAGES,
    ...GEMARA_PASSAGES
];

// ─── INDEXED BY ID ───────────────────────────────────────────────────────────
export const PASSAGE_BY_ID = Object.fromEntries(
    ALL_PASSAGES.map(p => [p.id, p])
);

// ─── BY TYPE (ELEMENTAL) ─────────────────────────────────────────────────────
export const PASSAGES_BY_TYPE = {
    Ground: ALL_PASSAGES.filter(p => p.damageType === 'Ground'),
    Water:  ALL_PASSAGES.filter(p => p.damageType === 'Water'),
    Fire:   ALL_PASSAGES.filter(p => p.damageType === 'Fire'),
    Air:    ALL_PASSAGES.filter(p => p.damageType === 'Air')
};

// ─── BY TIER ─────────────────────────────────────────────────────────────────
export const PASSAGES_BY_TIER = {
    COMMON:     ALL_PASSAGES.filter(p => p.tier === 'COMMON' || !p.tier),
    UNCOMMON:   ALL_PASSAGES.filter(p => p.tier === 'UNCOMMON'),
    RARE:       ALL_PASSAGES.filter(p => p.tier === 'RARE'),
    LEGENDARY:  ALL_PASSAGES.filter(p => p.tier === 'LEGENDARY')
};

// ─── STARTING LOADOUT ────────────────────────────────────────────────────────
/** B"H: The 4 passages every new Chossid begins with */
export const STARTER_PASSAGES = [
    PASSAGE_BY_ID['avos_1_2'],  // Three Pillars — Ground
    PASSAGE_BY_ID['avos_1_14'], // If Not Now — Fire
    PASSAGE_BY_ID['avos_1_4'],  // Sit in the Dust — Water
    PASSAGE_BY_ID['avos_1_6']   // Judge Favorably — Air
];

// ─── LEGACY TYPE_CHART ───────────────────────────────────────────────────────
export const TYPE_CHART = {
    Ground: { effectiveAgainst: ['Ground'], weakAgainst: ['Air'],   multiplier: 2.0 },
    Water:  { effectiveAgainst: ['Fire'],   weakAgainst: ['Ground'], multiplier: 2.0 },
    Fire:   { effectiveAgainst: ['Air'],    weakAgainst: ['Water'],  multiplier: 2.0 },
    Air:    { effectiveAgainst: ['Water'],  weakAgainst: ['Fire'],   multiplier: 2.0 }
};
