//B"H
// Boruch Hashem
// Blessed is He
/**
 * Which Drive texture dresses each Merkava mesh.
 * B"H — Yaakov 2026-10-13: real textures instead of flat colors.
 * Meshes not listed here keep their flat vessel color (glowy things —
 * shots, sparks, gates — read better flat with bloom).
 *
 * B"H — FORENSICS VERDICT: nothing was ever deleted. These are Yaakov's
 * original photographic textures (1.4 GB library, every URL verified 200),
 * chosen to look exciting: cobblestone roads, marble pillars, granite war
 * chariots, mossy golems.
 */
const LIB = 'https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/';
const VARIOUS = 'https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/various/';

export const MATERIAL_TEXTURES = Object.freeze({
	road: LIB + 'cobblestone.png',
	chariot: LIB + 'polished%20granite%20Rock%201.png',
	soldier: LIB + 'rusty%20iron.png',
	pillar: LIB + 'marble%201.png',
	prutah: LIB + 'marble%201.png',
	goldenPrutah: LIB + 'marble%201.png',
	boss: LIB + 'bluestone%201.png',
	warning: LIB + 'red%20brick%201.png',
	lane: null,
	obstacle: LIB + 'bluestone%201.png',
	golem: VARIOUS + 'Stone%20retaining%20wall%20masonry.png',
	klipah: LIB + 'bluestone%201.png',
	raven: null,
	archer: null,
	drainer: null,
	splitter: null,
	summoner: null,
	corrupter: null,
	thief: VARIOUS + 'Rough%20weathered%20oak%20wood%20planks.png',
	elite: LIB + 'polished%20granite%20Rock%201.png',
	// Shots, sparks, gates, particles, lane: intentionally flat (glow carries them).
	shot: null,
	enemyShot: null,
	spark: null,
	particle: null,
	gate: null,
	health: null
});
