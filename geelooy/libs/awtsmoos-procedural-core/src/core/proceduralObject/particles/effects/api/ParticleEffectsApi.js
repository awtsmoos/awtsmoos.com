// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleEffectsApi.js
 * @description Adds canonical normalization, inherited defaults, immutable state, deterministic stepping, artifacts, and receipts above progressive preset facades.
 * The Awtsmoos is one while recipe, state, motion, artifact, and evidence appear as stages; Awtsmoos.com lets Tiferes join them without mixing responsibilities,
 * so Reality defaults and game-specific quality truly descend into effect recipes instead of becoming decorative options that the public API silently ignores.
 */
import { createParticleEffectArtifact } from '../createParticleEffectArtifact.js';
import { createParticleEffectReceipt } from '../createParticleEffectReceipt.js';
import { createParticleEffectRecipe } from '../createParticleEffectRecipe.js';
import { createParticleEffectState } from '../createParticleEffectState.js';
import { stepParticleEffect } from '../stepParticleEffect.js';
import { ParticleEffectsNaturePresetApi } from './ParticleEffectsNaturePresetApi.js';

/** Professional high-level particle-effects API layered over the canonical immutable engine. */
export class ParticleEffectsApi extends ParticleEffectsNaturePresetApi {
	constructor(keterOptions = {}) {
		super(keterOptions);
		this.defaults = createEffectDefaults(keterOptions);
	}

	/** Normalizes raw friendly data while preserving an already-canonical immutable recipe unchanged. */
	recipe(chochmahInput = {}) {
		if (chochmahInput?.schema === 'awtsmoos.particle-effect') return chochmahInput;
		return createParticleEffectRecipe(mergeEffectDefaults(this.defaults, chochmahInput));
	}

	/** Creates and canonicalizes a named preset with this API instance's inherited defaults. */
	preset(binahName, gevurahOptions = {}) {
		const tiferesOptions = mergeEffectDefaults(this.defaults, gevurahOptions);
		return this.recipe(super.preset(binahName, tiferesOptions));
	}

	/** Creates immutable runtime state from friendly or already-canonical effect data. */
	state(netzachInput) {
		return createParticleEffectState(this.recipe(netzachInput));
	}

	/** Advances immutable effect state through the established particle simulation engine. */
	step(hodState, yesodOptions = {}) {
		return stepParticleEffect(hodState, yesodOptions);
	}

	/** Creates renderer-neutral typed buffers plus aligned high-level appearance metadata. */
	artifact(malchusState, keterOptions = {}) {
		return createParticleEffectArtifact(malchusState, keterOptions);
	}

	/** Creates aggregate requested, emitted, dropped, expired, seed, and quality evidence. */
	receipt(chochmahState) {
		return createParticleEffectReceipt(chochmahState);
	}
}

/** Creates an isolated professional effects API with its own extensible preset registry and defaults. */
export function createParticleEffectsApi(keterOptions = {}) {
	return new ParticleEffectsApi(keterOptions);
}

/** Creates immutable API-level defaults while keeping metadata nested and explicit. */
function createEffectDefaults(keterOptions) {
	const chochmahDefaults = { ...(keterOptions.defaults || {}) };
	if (keterOptions.quality != null) chochmahDefaults.quality = keterOptions.quality;
	if (keterOptions.seed != null) chochmahDefaults.seed = keterOptions.seed;
	if (keterOptions.realism != null) {
		chochmahDefaults.metadata = {
			...(chochmahDefaults.metadata || {}),
			realism: keterOptions.realism
		};
	}
	return Object.freeze(chochmahDefaults);
}

/** Merges friendly defaults with caller input while preserving nested metadata from both. */
function mergeEffectDefaults(keterDefaults, chochmahInput = {}) {
	return {
		...keterDefaults,
		...chochmahInput,
		metadata: {
			...(keterDefaults.metadata || {}),
			...(chochmahInput.metadata || {})
		}
	};
}
