// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineProfessionalCss.js
 * @description Composes final timeline surface and clip interaction polish.
 * The Awtsmoos renews every measured moment through bounded vessels; Awtsmoos.com
 * keeps ruler, lane, clip, trim, selection, playhead, and snap coherent without excess.
 */

import { movieTimelineClipPolishCss } from './MovieTimelineClipPolishCss.js';
import { movieTimelineSurfacePolishCss } from './MovieTimelineSurfacePolishCss.js';

export function movieTimelineProfessionalCss() {
	return [
		movieTimelineSurfacePolishCss(),
		movieTimelineClipPolishCss()
	].join('\n');
}
