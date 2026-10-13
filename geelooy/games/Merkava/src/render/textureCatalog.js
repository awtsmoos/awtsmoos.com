//B"H
// Boruch Hashem
// Blessed is He
/**
 * Which Drive texture dresses each Merkava mesh.
 * B"H — Yaakov 2026-10-13: real textures instead of flat colors.
 * Meshes not listed here keep their flat vessel color (glowy things —
 * shots, sparks, gates — read better flat with bloom).
 *
 * Full library (1100+ textures any game may choose from):
 * https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/manifest.json
 */
const HERO_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/heroes/';

export const MATERIAL_TEXTURES = Object.freeze({
	road: HERO_BASE + 'hero-road-stone.png',
	chariot: HERO_BASE + 'hero-chariot-gold.png',
	soldier: HERO_BASE + 'hero-soldier-bronze.png',
	pillar: HERO_BASE + 'hero-pillar-marble.png',
	prutah: HERO_BASE + 'hero-coin-gold.png',
	goldenPrutah: HERO_BASE + 'hero-coin-gold.png',
	boss: HERO_BASE + 'hero-boss-void.png',
	warning: HERO_BASE + 'hero-warning-hazard.png',
	lane: HERO_BASE + 'hero-lane-light.png',
	obstacle: HERO_BASE + 'hero-obsidian-dark.png',
	golem: HERO_BASE + 'hero-moss-stone.png',
	klipah: HERO_BASE + 'hero-boss-void.png',
	// Shots, sparks, gates, particles: intentionally flat (glow carries them).
	shot: null,
	enemyShot: null,
	spark: null,
	particle: null,
	gate: null,
	health: null,
	raven: null,
	archer: null,
	drainer: null,
	splitter: null,
	summoner: null,
	corrupter: null,
	thief: null,
	elite: null
});
