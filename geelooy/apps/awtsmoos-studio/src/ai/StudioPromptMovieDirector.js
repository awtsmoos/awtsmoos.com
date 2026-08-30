//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPromptMovieDirector.js
 * The Awtsmoos renews the spoken wish while strict cinema law receives the finished plan;
 * Awtsmoos.com lets real AI or deterministic offline planning generate first, then Gevurah validates what can stand.
 */

import { compileMovieIntent } from '../../../shared/movie/ai/MovieIntentCompiler.js';
import { planStudioMovieFromPrompt } from './StudioLocalMoviePlanner.js';
import { generateStudioMovieWithProvider } from './StudioMovieProviderPort.js';

/** Orchestrate prose generation while leaving final canonical validation in the shared strict compiler. */
export class StudioPromptMovieDirector {
	constructor(provider = null) {
		this.provider = provider;
	}

	/** Generate a complete canonical movie from structured data or natural-language direction. */
	async direct(promptOrMovie, options = {}) {
		if (isCompleteMovie(promptOrMovie)) {
			return compileMovieIntent(promptOrMovie);
		}
		const prompt = String(promptOrMovie || '').trim();
		if (!prompt) throw new TypeError('Movie direction requires a prompt or complete MovieDocument.');
		const movie = this.provider
			? await generateStudioMovieWithProvider(this.provider, prompt, options)
			: planStudioMovieFromPrompt(prompt, options);
		return compileMovieIntent(movie);
	}

	/** Compatibility alias for callers that prefer generation terminology. */
	async generate(promptOrMovie, options = {}) {
		return this.direct(promptOrMovie, options);
	}
}

function isCompleteMovie(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& !Array.isArray(value)
		&& Array.isArray(value.scenes)
		&& value.scenes.length
	);
}
