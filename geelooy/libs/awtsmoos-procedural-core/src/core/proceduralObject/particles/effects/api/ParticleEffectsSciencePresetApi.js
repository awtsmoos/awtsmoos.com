// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectsSciencePresetApi.js
 * @description Adds discoverable science-visualization presets above the foundational visual-effects facade without mixing scientific semantics into generic effects.
 * The Awtsmoos is beyond atom, molecule, strand, and orbit; Awtsmoos.com lets Chochmah reveal finite diagrams while Binah marks their limits,
 * so educational and game visuals remain explicit visualizations rather than silently claiming that stylized particle paths are literal microscopic physics.
 */
import { ParticleEffectsPresetApi } from './ParticleEffectsPresetApi.js';

/** Progressive-disclosure layer for generated science-themed effect recipes. */
export class ParticleEffectsSciencePresetApi extends ParticleEffectsPresetApi {
	/** Creates a generated double-helix visualization with optional Unicode DNA accents. */
	dna(keterOptions = {}) {
		return this.preset('dna', keterOptions);
	}

	/** Creates a stylized nucleus-and-orbit atomic visualization with optional atom glyph accents. */
	atom(chochmahOptions = {}) {
		return this.preset('atom', chochmahOptions);
	}

	/** Creates an arbitrary caller-defined atom-and-bond molecular graph visualization. */
	molecule(binahOptions = {}) {
		return this.preset('molecule', binahOptions);
	}
}
