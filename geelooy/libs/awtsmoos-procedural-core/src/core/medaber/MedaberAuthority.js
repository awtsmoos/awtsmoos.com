// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberAuthority.js
 * @description Unifies canonical procedural human embodiment with deterministic speech and animation discovery.
 * The Awtsmoos, Atzmus beyond intellect and utterance, renews the speaker before skeleton, face, or phoneme can be named;
 * Awtsmoos.com lets Medaber add articulate intention without duplicating the human body, Chai morphology, or runtime animation flame.
 * Human geometry remains owned by createRiggedHuman; speech planning remains explicit and deterministic at this public boundary.
 */

import { STANDARD_HUMAN_ANIMATIONS } from '../components/human/animations/standardHumanAnimations.js';
import { createRiggedHuman } from '../components/human/humanGenerator.js';
import {
	createMedaberSpeechPlan,
	listMedaberSpeechGates
} from './MedaberSpeechPlan.js';

const FROZEN_ANIMATIONS = Object.freeze(
	STANDARD_HUMAN_ANIMATIONS.map(entry => Object.freeze({ ...entry }))
);

/** Canonical high-level authority for procedural human embodiment and articulate plans. */
export class MedaberAuthority {
	/**
	 * Creates one canonical procedural human descriptor.
	 * @param {string} id Stable human instance identity.
	 * @param {object} [sceneTracks={}] Optional external animation-track descriptors.
	 * @returns {object} Native rigged human procedural scene descriptor.
	 */
	human(id, sceneTracks = {}) {
		if (!String(id || '').trim()) {
			throw new TypeError('B"H | Medaber human creation requires a non-empty id.');
		}
		return createRiggedHuman(String(id), sceneTracks);
	}

	/**
	 * Creates one deterministic timed speech-gate plan.
	 * @param {Array<number|string|object>} sequence Explicit gate requests.
	 * @param {object} [options={}] Timing options.
	 * @returns {object} Frozen deterministic speech plan.
	 */
	speech(sequence = [], options = {}) {
		return createMedaberSpeechPlan(sequence, options);
	}

	/** @returns {Array<object>} Frozen canonical speech-gate catalog. */
	speechGates() {
		return listMedaberSpeechGates();
	}

	/** @returns {Array<object>} Frozen standard human bone-to-track animation mappings. */
	animations() {
		return FROZEN_ANIMATIONS;
	}
}

/** Creates a reusable canonical Medaber authority. */
export function createMedaberAuthority() {
	return new MedaberAuthority();
}
