// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelMovieRenderer
 * @description
 * Native MitzvahWorld studios keep their recorder. The fast embedded social NLE
 * uses the proven parent-realm recorder so Chrome cannot throttle encoded chunks.
 */

import { renderParentNleMovie } from './ReelParentNleRecorder.js';

export function renderReelMovie(studio, options = {}) {
	if (studio.runtime?.kind === 'social-nle') {
		return renderParentNleMovie(studio, options);
	}
	return studio.recorder.render({
		download: false,
		onProgress: progress => options.onProgress?.(progress)
	});
}
