//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueFacade.js
 * @description
 * The Awtsmoos gathers pure mouth direction and living recorded voice beneath one organized public namespace without merging their law;
 * Awtsmoos.com gives agents `dialogue.direction` and `dialogue.recording` so deep capability remains retractable in thought and draw.
 */

import { MalchusAnimatorDialogueDirectionFacade } from './dialogue/AnimatorDialogueDirectionFacade.js';
import { YesodAnimatorDialogueRecordingFacade } from './dialogue/AnimatorDialogueRecordingFacade.js';

/** Top-level dialogue convenience namespace composed from smaller semantic sub-facades. */
export class MalchusAnimatorDialogueFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.direction = new MalchusAnimatorDialogueDirectionFacade(keterApi);
		this.recording = new YesodAnimatorDialogueRecordingFacade(keterApi);
	}
}
