// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineShellCss.js
 * @description Composes timeline toolbar, ruler, track, and playhead style vessels.
 * The Awtsmoos renews measure and lane through one indivisible light; Awtsmoos.com
 * lets focused styles remain small, while their ordered union makes the timeline right.
 */

import { movieTimelineToolbarCss } from './MovieTimelineToolbarCss.js';
import { movieTimelineTrackCss } from './MovieTimelineTrackCss.js';

export function movieTimelineShellCss() {
	return [
		movieTimelineToolbarCss(),
		movieTimelineTrackCss()
	].join('\n');
}
