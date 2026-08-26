// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectsPresetApi.js
 * @description Defines the foundational friendly preset API for fire, explosions, glyphs, registry extension, and preset discovery.
 * The Awtsmoos is beyond shortcut and depth; Awtsmoos.com lets Keter expose a few clear gates while Daas preserves the pure factories beneath,
 * so callers gain ergonomic autocomplete without one-line compression, hidden global state, giant switches, or duplicate simulation logic.
 */
import { createParticleEffectPresetRegistry } from './ParticleEffectPresetRegistry.js';

/** Foundational preset facade for visual effects shared by every higher specialty layer. */
export class ParticleEffectsPresetApi {
	constructor(keterOptions = {}) {
		this.presets = keterOptions.presets || createParticleEffectPresetRegistry();
	}

	/** Creates a named friendly recipe through this instance's isolated registry. */
	preset(chochmahName, binahOptions = {}) {
		return this.presets.create(chochmahName, binahOptions);
	}

	/** Registers a custom recipe factory in this facade instance only. */
	registerPreset(gevurahName, tiferesFactory) {
		this.presets.register(gevurahName, tiferesFactory);
		return this;
	}

	/** Removes one preset mapping from this facade instance without touching other worlds. */
	unregisterPreset(netzachName) {
		return this.presets.unregister(netzachName);
	}

	/** Returns immutable sorted preset names for discovery and tooling. */
	presetNames() {
		return this.presets.names();
	}

	/** Creates layered combustion-inspired fire with generated geometry and optional Unicode accents. */
	fire(hodOptions = {}) {
		return this.preset('fire', hodOptions);
	}

	/** Creates a staged explosion with flash, pressure shell, sparks, 3D debris, smoke, and optional glyphs. */
	explosion(yesodOptions = {}) {
		return this.preset('explosion', yesodOptions);
	}

	/** Creates arbitrary grapheme-aware Unicode, emoji, symbols, or caller-defined text particles. */
	glyphs(malchusOptions = {}) {
		return this.preset('glyphs', malchusOptions);
	}
}
