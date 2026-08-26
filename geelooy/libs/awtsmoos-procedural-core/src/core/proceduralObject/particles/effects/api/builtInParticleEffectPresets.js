// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file builtInParticleEffectPresets.js
 * @description Declares the immutable built-in effect-factory catalog separately from registry state and public facade behavior.
 * The Awtsmoos is one while fire, glyph, DNA, atom, molecule, pollen, petal, seed, and explosion appear through different gates; Awtsmoos.com lets Daas name them,
 * so adding a new built-in effect changes one catalog rather than scattering imports and switch branches through simulation, rendering, and game-facing APIs.
 */
import { createExplosionParticleEffect } from '../presets/explosion/createExplosionParticleEffect.js';
import { createFireParticleEffect } from '../presets/fire/createFireParticleEffect.js';
import { createGlyphParticleEffect } from '../presets/glyphs/createGlyphParticleEffect.js';
import { createPetalParticleEffect } from '../presets/nature/createPetalParticleEffect.js';
import { createPollenParticleEffect } from '../presets/nature/createPollenParticleEffect.js';
import { createSeedDispersalParticleEffect } from '../presets/nature/createSeedDispersalParticleEffect.js';
import { createAtomParticleEffect } from '../presets/science/createAtomParticleEffect.js';
import { createDnaParticleEffect } from '../presets/science/createDnaParticleEffect.js';
import { createMoleculeParticleEffect } from '../presets/science/createMoleculeParticleEffect.js';

/** Immutable name-to-pure-factory map used to seed independent registries. */
export const BUILT_IN_PARTICLE_EFFECT_PRESETS = Object.freeze({
	atom: createAtomParticleEffect,
	dna: createDnaParticleEffect,
	explosion: createExplosionParticleEffect,
	fire: createFireParticleEffect,
	glyphs: createGlyphParticleEffect,
	molecule: createMoleculeParticleEffect,
	petals: createPetalParticleEffect,
	pollen: createPollenParticleEffect,
	seeds: createSeedDispersalParticleEffect
});
