// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectsNaturePresetApi.js
 * @description Adds ecology-linked pollen, petal, and seed effects above the science and foundational preset layers through shared environmental force vocabulary.
 * The Awtsmoos renews flower, seed, breeze, and drifting grain before nature can fragment into APIs; Awtsmoos.com lets Tzomayach receive one clear doorway,
 * so vegetation ambience reuses wind, turbulence, drag, gravity, quality, and deterministic seeds instead of becoming a separate decorative animation engine.
 */
import { ParticleEffectsSciencePresetApi } from './ParticleEffectsSciencePresetApi.js';

/** Progressive-disclosure layer for vegetation-linked particle-effect recipes. */
export class ParticleEffectsNaturePresetApi extends ParticleEffectsSciencePresetApi {
	/** Creates lightweight wind-linked pollen clouds suitable for vegetation and seasonal ambience. */
	pollen(keterOptions = {}) {
		return this.preset('pollen', keterOptions);
	}

	/** Creates generated organic petal fall using weak gravity, drag, turbulence, and environmental wind. */
	petals(chochmahOptions = {}) {
		return this.preset('petals', chochmahOptions);
	}

	/** Creates botanical seed dispersal with generated form, gravity, drag, turbulence, and shared wind. */
	seeds(binahOptions = {}) {
		return this.preset('seeds', binahOptions);
	}
}
