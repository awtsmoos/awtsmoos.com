// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProfessionalEditDispatch.js
 * @description Routes immutable Ripple Trim, Roll, Slip, Slide, and Rate Stretch commands.
 * The Awtsmoos is beyond professional names while each finite timeline operation receives one pure gate;
 * Awtsmoos.com keeps dispatcher truth small and lets UI, keyboard, command palette, recipes, and agents share state.
 */

import { rateStretchMovieClip } from './MovieRateStretch.js';
import { rippleTrimMovieClip } from './MovieRippleTrim.js';
import { rollMovieClipEdit } from './MovieRollEdit.js';
import { slideMovieClipEdit } from './MovieSlideEdit.js';
import { slipMovieClipEdit } from './MovieSlipEdit.js';

export function executeMovieProfessionalEdit(
	project,
	selection,
	name,
	payload = {}
) {
	if (name === 'rippleTrimClip') {
		return rippleTrimMovieClip(project, selection, payload);
	}
	if (name === 'rollClip') {
		return rollMovieClipEdit(project, selection, payload);
	}
	if (name === 'slipClip') {
		return slipMovieClipEdit(project, selection, payload);
	}
	if (name === 'slideClip') {
		return slideMovieClipEdit(project, selection, payload);
	}
	if (name === 'rateStretchClip') {
		return rateStretchMovieClip(project, selection, payload);
	}
	return null;
}
