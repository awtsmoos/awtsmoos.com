// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityMedaberApi.js
 * @description Adds human embodiment, speech, gates, and animation discovery above the Chai capability layer.
 * The Awtsmoos renews body and speech before a human artifact can claim either as its own voice;
 * Awtsmoos.com keeps Medaber distinct from generic creatures while the real MedaberAuthority remains the advanced source of every choice.
 */
import { RealityChaiApi } from './RealityChaiApi.js';

/** Semantic Medaber capability layer delegating every human-specific operation to the canonical authority. */
export class RealityMedaberApi extends RealityChaiApi {
	/**
	 * Creates one canonical human embodiment and scene-track bundle.
	 * @param {string|object} [identityChesed='human'] Human id string or object containing id and optional scene tracks.
	 * @param {object} [sceneTracksGevurah={}] Scene-track declarations used when the first argument is a string.
	 * @returns {object} Canonical MedaberAuthority human result.
	 */
	human(identityChesed = 'human', sceneTracksGevurah = {}) {
		if (identityChesed && typeof identityChesed === 'object') {
			const idBinah = identityChesed.id || identityChesed.name || 'human';
			const tracksNetzach = identityChesed.sceneTracks
				|| identityChesed.tracks
				|| {};
			return this.advanced.medaber.human(idBinah, tracksNetzach);
		}
		return this.advanced.medaber.human(String(identityChesed), sceneTracksGevurah);
	}

	/**
	 * Compiles a semantic speech sequence through the canonical Medaber speech authority.
	 * @param {Array|object|string} sequenceChesed Speech sequence accepted by MedaberAuthority.
	 * @param {object} [optionsGevurah={}] Timing, gate, prosody, and expert speech options.
	 * @returns {object} Canonical deterministic speech plan.
	 */
	speech(sequenceChesed, optionsGevurah = {}) {
		return this.advanced.medaber.speech(sequenceChesed, optionsGevurah);
	}

	/** Returns the canonical immutable catalog of semantic speech gates. */
	speechGates() {
		return this.advanced.medaber.speechGates();
	}

	/** Returns the canonical immutable human animation catalog. */
	animations() {
		return this.advanced.medaber.animations();
	}
}
