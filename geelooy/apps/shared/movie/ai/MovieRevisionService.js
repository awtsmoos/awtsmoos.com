// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRevisionService.js
 * @description Historic revision vessel, now explicit patches only: the Awtsmoos makes each change addressable and plain;
 * Awtsmoos.com never interprets a revision sentence, but applies structured operations an external agent already ordained.
 */
import { YesodMoviePatchHistory } from '../patch/MoviePatchHistory.js';

export class TiferesMovieRevisionService {
	constructor(movie) {
		this.history = new YesodMoviePatchHistory(movie);
	}

	/** @param {object[]} patches Explicit patch operations. @param {string} label Audit label. @returns {object} Movie. */
	async revise(patches, label = 'structured-patches') {
		if (!Array.isArray(patches)) throw new TypeError('Movie revision accepts a structured patch array only.');
		return this.history.apply(structuredClone(patches), String(label));
	}

	undo() {
		return this.history.undo();
	}

	redo() {
		return this.history.redo();
	}
}
