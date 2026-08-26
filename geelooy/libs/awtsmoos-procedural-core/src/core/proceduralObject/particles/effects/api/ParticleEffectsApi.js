// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectsApi.js
 * @description Adds canonical recipe normalization, immutable runtime state, deterministic stepping, artifacts, and receipts above the progressive preset facades.
 * The Awtsmoos is one while recipe, state, motion, artifact, and evidence appear as stages; Awtsmoos.com lets Tiferes join them without mixing responsibilities,
 * so games receive one professional effects doorway while expert callers may still import every pure engine function, form generator, and preset independently.
 */
import { createParticleEffectArtifact } from '../createParticleEffectArtifact.js';
import { createParticleEffectReceipt } from '../createParticleEffectReceipt.js';
import { createParticleEffectRecipe } from '../createParticleEffectRecipe.js';
import { createParticleEffectState } from '../createParticleEffectState.js';
import { stepParticleEffect } from '../stepParticleEffect.js';
import { ParticleEffectsNaturePresetApi } from './ParticleEffectsNaturePresetApi.js';

/** Professional high-level particle-effects API layered over the canonical immutable engine. */
export class ParticleEffectsApi extends ParticleEffectsNaturePresetApi {
	/** Normalizes raw friendly effect data into the canonical serializable recipe contract. */
	recipe(keterInput) {
		return createParticleEffectRecipe(keterInput);
	}

	/** Creates and canonicalizes a named preset in one deterministic step. */
	preset(chochmahName, binahOptions = {}) {
		return this.recipe(super.preset(chochmahName, binahOptions));
	}

	/** Creates immutable runtime state from friendly or already-canonical effect data. */
	state(gevurahInput) {
		return createParticleEffectState(gevurahInput);
	}

	/** Advances immutable effect state through the established particle simulation engine. */
	step(tiferesState, netzachOptions = {}) {
		return stepParticleEffect(tiferesState, netzachOptions);
	}

	/** Creates renderer-neutral typed buffers plus aligned high-level appearance metadata. */
	artifact(hodState, yesodOptions = {}) {
		return createParticleEffectArtifact(hodState, yesodOptions);
	}

	/** Creates aggregate requested, emitted, dropped, expired, seed, and quality evidence. */
	receipt(malchusState) {
		return createParticleEffectReceipt(malchusState);
	}
}

/** Creates an isolated professional effects API with its own extensible preset registry. */
export function createParticleEffectsApi(keterOptions = {}) {
	return new ParticleEffectsApi(keterOptions);
}
