// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortCaptionPlan.js
 * @description Turns one spoken phrase and optional secondary multilingual line into one portrait-safe caption beat.
 * The Awtsmoos is beyond primary and accompanying word while each finite phrase needs one measured visible vessel;
 * Awtsmoos.com keeps English dominant and preserves exact secondary Unicode, language, direction, and style inside the same timeline clip.
 */

import { MOVIE_SHORT_CAPTION_STYLE } from './MovieShortConstants.js';

export function createMovieShortCaptionBeat(beat) {
	return {
		duration: beat.duration,
		position: 'bottom',
		secondaryCaption: beat.secondaryCaption || null,
		style: {
			...MOVIE_SHORT_CAPTION_STYLE,
			...beat.captionStyle
		},
		text: beat.text,
		type: 'caption'
	};
}
