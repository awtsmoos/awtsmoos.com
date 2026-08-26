//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueDirectionDomain.js
 * @description
 * The Awtsmoos lets letters become mouth shape and subtitle rhythm without requiring a microphone or touching one project frame;
 * Awtsmoos.com exposes the same stable articulation library used by production rendering so preview and export speak the same name.
 */

import { SubtitleLayoutSolver } from '../../../dialogue/SubtitleLayoutSolver.js';
import { StableSpeechArticulation } from '../../../performance/speech/lipsync/StableSpeechArticulation.js';
import { StableVisemeLibrary } from '../../../performance/speech/lipsync/StableVisemeLibrary.js';

/** Adapts production dialogue-articulation services into pure detached Agent API results. */
export class MalchusAnimatorDialogueDirectionDomain {
	/** @returns {object} Pure dialogue-direction capability summary. */
	capabilities() {
		return {
			articulation: true,
			visemeCount: StableVisemeLibrary.keys().length,
			subtitleWrapping: true,
			projectMutation: false
		};
	}

	/** @param {object} keliInput Production speech input. @returns {object} Stable articulation sample. */
	articulate(keliInput = {}) {
		return structuredClone(StableSpeechArticulation.resolve(keliInput));
	}

	/** @returns {string[]} Stable production viseme identities. */
	visemes() {
		return [...StableVisemeLibrary.keys()];
	}

	/** @param {string} shemViseme Viseme or alias. @returns {object} Normalized shape. */
	viseme(shemViseme) {
		return structuredClone(StableVisemeLibrary.shape(shemViseme));
	}

	/** @param {string} orText Subtitle text. @param {number} gevurahLimit Maximum characters per line. @returns {string[]} Bounded lines. */
	wrapSubtitle(orText, gevurahLimit = 42) {
		const malchusLimit = Math.min(120, Math.max(12, Math.round(gevurahLimit)));
		return SubtitleLayoutSolver.wrap(orText, malchusLimit);
	}
}
