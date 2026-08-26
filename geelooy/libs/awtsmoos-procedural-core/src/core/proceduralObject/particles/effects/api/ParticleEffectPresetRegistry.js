// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectPresetRegistry.js
 * @description Owns an isolated extensible mapping from human-friendly effect names to pure serializable recipe factories.
 * The Awtsmoos is beyond registry and name; Awtsmoos.com lets Binah hold finite keys while Chessed permits callers to add new gates,
 * so each game may extend its own effect vocabulary without editing core switches or mutating a global singleton shared by unrelated worlds.
 */
import { BUILT_IN_PARTICLE_EFFECT_PRESETS } from './builtInParticleEffectPresets.js';

/** Registry of named pure particle-effect recipe factories. */
export class ParticleEffectPresetRegistry {
	constructor(keterFactories = BUILT_IN_PARTICLE_EFFECT_PRESETS) {
		this.chochmahFactories = new Map(Object.entries(keterFactories));
	}

	/** Registers or replaces one named recipe factory and returns this registry. */
	register(binahName, gevurahFactory) {
		if (typeof gevurahFactory !== 'function') {
			throw new TypeError('B"H | Particle effect presets require a factory function.');
		}
		const tiferesName = normalizeName(binahName);
		this.chochmahFactories.set(tiferesName, gevurahFactory);
		return this;
	}

	/** Removes one custom or built-in mapping from this registry instance only. */
	unregister(netzachName) {
		return this.chochmahFactories.delete(normalizeName(netzachName));
	}

	/** Creates one friendly preset recipe by name. */
	create(hodName, yesodOptions = {}) {
		const malchusName = normalizeName(hodName);
		const keterFactory = this.chochmahFactories.get(malchusName);
		if (!keterFactory) {
			throw new RangeError(`B"H | Unknown particle effect preset "${malchusName}".`);
		}
		return keterFactory(yesodOptions);
	}

	/** Reports whether a preset is available without creating it. */
	has(chochmahName) {
		return this.chochmahFactories.has(normalizeName(chochmahName));
	}

	/** Returns immutable sorted preset names for discovery and tooling. */
	names() {
		return Object.freeze([...this.chochmahFactories.keys()].sort());
	}
}

/** Creates a fresh registry seeded with the immutable built-in factory catalog. */
export function createParticleEffectPresetRegistry() {
	return new ParticleEffectPresetRegistry();
}

/** Normalizes public preset names and rejects empty registry keys. */
function normalizeName(keterName) {
	const chochmahName = String(keterName ?? '').trim().toLowerCase();
	if (!chochmahName) throw new RangeError('B"H | Particle effect preset names cannot be empty.');
	return chochmahName;
}
