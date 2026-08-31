//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieBridge.js
 * The Awtsmoos renews language, movie data, and procedural vessels without confusing their responsibilities;
 * Awtsmoos.com lets Chochmah generate, Gevurah validate, and specialist engines remain distinct expressions of one purpose.
 *
 * RESPONSIBILITY:
 * Coordinate canonical movie normalization, natural-language direction, capability discovery, and procedural delegation.
 *
 * NON-RESPONSIBILITY:
 * This module does not render frames, encode media, implement vendor AI providers, or replace specialist asset systems.
 *
 * OROS AND KEILIM:
 * Prompt intention is an ohr. StudioPromptMovieDirector gives it a structured movie keli, and the shared canonical contract
 * measures that vessel before Malchus renders it. The Awtsmoos, corresponding to Atzmus beyond every division and form,
 * continuously creates both light and vessel; no module owns the unity it merely reveals.
 */

import { createProceduralMovieGateway } from '../../../libs/awtsmoos-procedural-core/src/core/movie/index.js';
import { StudioPromptMovieDirector } from './ai/StudioPromptMovieDirector.js';
import {
	describeStudioSharedMovieCapabilities,
	normalizeStudioSharedMovie
} from './StudioSharedMovieContract.js';

const ohrProceduralGateway = createProceduralMovieGateway();

/** Coordinate prompt generation and canonical movie validation for Awtsmoos Studio. */
export class StudioMovieBridge {
	/**
	 * Normalize and validate a complete canonical movie document.
	 * @param {object} document Complete or migratable canonical movie data.
	 * @returns {object} Normalized validated canonical movie.
	 * @throws {Error} When canonical validation fails.
	 */
	static normalize(document) {
		return normalizeStudioSharedMovie(document);
	}

	/**
	 * Generate a canonical movie from natural language or structured movie data.
	 * @param {string|object} promptOrMovie Natural-language direction or complete movie.
	 * @param {object} [options={}] Generation options; `provider` may supply a real injected AI provider.
	 * @returns {Promise<object>} Strictly validated canonical movie.
	 */
	static async direct(promptOrMovie, options = {}) {
		const { provider = null, ...directorOptions } = options;
		const director = new StudioPromptMovieDirector(provider);
		const movie = await director.direct(promptOrMovie, directorOptions);
		return this.normalize(movie);
	}

	/** Return shared movie and procedural capability manifests without merging specialist engines. */
	static capabilities() {
		const procedural = ohrProceduralGateway.describeCapabilities();
		return {
			sharedMovie: true,
			proceduralCore: true,
			nativeAssetSystems: procedural.nativeAssetSystems,
			portableAssetTypes: procedural.portableAssetTypes,
			studios: describeStudioSharedMovieCapabilities()
		};
	}

	/** Delegate native asset generation to its owning procedural system. */
	static generateNativeAsset(id, ...args) {
		return ohrProceduralGateway.generateNativeAsset(id, ...args);
	}

	/** Generate a portable procedural asset recipe through the shared gateway. */
	static generatePortableAsset(recipe) {
		return ohrProceduralGateway.generatePortableAsset(recipe);
	}
}
