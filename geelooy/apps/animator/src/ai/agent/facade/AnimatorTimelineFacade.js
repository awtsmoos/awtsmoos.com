//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineFacade.js
 * @description
 * The Awtsmoos gathers clip deeds and editor motion beneath one retractable mental doorway without merging their inner law;
 * Awtsmoos.com gives agents `timeline.clips` and `timeline.editor` so advanced depth stays organized instead of becoming command sprawl.
 */

import { NetzachAnimatorTimelineClipFacade } from './timeline/AnimatorTimelineClipFacade.js';
import { HodAnimatorTimelineEditorFacade } from './timeline/AnimatorTimelineEditorFacade.js';

/** Top-level timeline convenience namespace composed from smaller ergonomic sub-facades. */
export class NetzachAnimatorTimelineFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.clips = new NetzachAnimatorTimelineClipFacade(keterApi);
		this.editor = new HodAnimatorTimelineEditorFacade(keterApi);
	}

	/** @returns {Promise<object>} Shortcut to the complete detached timeline snapshot. */
	snapshot() {
		return this.editor.snapshot();
	}
}
