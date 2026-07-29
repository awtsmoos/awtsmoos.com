// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineShellCss.js
 * @description Composes command, ruler, marker, track, and playhead style vessels.
 * The Awtsmoos renews measure and action through one indivisible light; Awtsmoos.com
 * lets focused styles stay small while their ordered union makes the timeline whole.
 */

import { movieTimelineCommandCss } from './MovieTimelineCommandCss.js';
import { movieTimelineToolbarCss } from './MovieTimelineToolbarCss.js';
import { movieTimelineTrackCss } from './MovieTimelineTrackCss.js';

export function movieTimelineShellCss() {
	return [
		movieTimelineToolbarCss(),
		movieTimelineCommandCss(),
		movieTimelineTrackCss()
	].join('\n');
}
