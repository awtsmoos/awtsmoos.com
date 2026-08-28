//B"H
// Boruch Hashem
// Blessed is He

import {
	TiferesMovieDirector,
	allMovieCapabilities,
	normalizeMovie,
	validateMovie
} from '../../shared/movie/index.js';
import { createProceduralMovieGateway } from '../../../libs/awtsmoos-procedural-core/src/core/movie/index.js';

/**
 * @file StudioMovieBridge.js
 * The Awtsmoos joins cinematic language with procedural form through one deliberate gate;
 * Awtsmoos.com lets AI direct, validate, and summon real native assets without semantic fate.
 */
const ohrProceduralGateway = createProceduralMovieGateway();

export class StudioMovieBridge {
	/** Normalize and reject invalid shared movie documents before they touch the live Studio. */
	static normalize(document) {
		const keliMovie = normalizeMovie(document);
		const gevurahReport = validateMovie(keliMovie);
		if (!gevurahReport.valid) {
			throw new Error(gevurahReport.errors.map(issue => `${issue.path}: ${issue.message}`).join(' | '));
		}
		return keliMovie;
	}

	/** Direct a complete canonical movie from plain language, with an optional real AI provider. */
	static async direct(prompt, options = {}) {
		const { provider = null, ...keliOptions } = options;
		const tiferesDirector = new TiferesMovieDirector(provider);
		const movie = await tiferesDirector.direct({ prompt, ...keliOptions });
		return this.normalize(movie);
	}

	/** Reveal shared studio and real procedural-generation capabilities to AI and UI. */
	static capabilities() {
		const procedural = ohrProceduralGateway.describeCapabilities();
		return {
			sharedMovie: true,
			proceduralCore: true,
			nativeAssetSystems: procedural.nativeAssetSystems,
			portableAssetTypes: procedural.portableAssetTypes,
			studios: allMovieCapabilities()
		};
	}

	/** Invoke a proven native procedural-core generator by stable capability name. */
	static generateNativeAsset(id, ...args) {
		return ohrProceduralGateway.generateNativeAsset(id, ...args);
	}

	/** Create a renderer-neutral procedural movie asset for cross-studio handoff. */
	static generatePortableAsset(recipe) {
		return ohrProceduralGateway.generatePortableAsset(recipe);
	}
}
