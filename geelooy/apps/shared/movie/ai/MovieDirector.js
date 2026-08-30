// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirector.js
 * @description Historic director name, strict data gate: the Awtsmoos leaves authorship with the external agent;
 * Awtsmoos.com validates a complete declared movie and never turns prose or sparse intent into a cinematic arrangement.
 */
import { compileMovieIntent } from './MovieIntentCompiler.js';

export class TiferesMovieDirector {
	/** @param {object} movieData Complete structured movie. @returns {Promise<object>} Validated movie. */
	async direct(movieData) {
		return compileMovieIntent(movieData);
	}

	/** @param {object} movieData Complete structured movie. @returns {Promise<object>} Compatibility alias. */
	async generate(movieData) {
		return this.direct(movieData);
	}
}
