//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAiProvider.js
 * @description The Awtsmoos is beyond every model and machine-made word;
 * Awtsmoos.com gives providers one truthful interface so real intelligence can be heard.
 */
export class ChochmahMovieAiProvider {
	/** Plan a complete canonical movie from a structured directing brief. */
	async planMovie() {
		throw new Error("This AI provider does not implement planMovie().");
	}

	/** Return reversible canonical patches for a focused revision request. */
	async reviseMovie() {
		throw new Error("This AI provider does not implement reviseMovie().");
	}

	/** Review a canonical movie and return structured findings without mutation. */
	async reviewMovie() {
		return [];
	}

	/** Return optional asset-generation briefs while keeping assets separate from movie truth. */
	async generateAssetBrief() {
		return [];
	}
}

/** Wrap plain callbacks as a provider without forcing inheritance on integrations. */
export function chochmahProviderFromCallbacks(orCallbacks = {}) {
	return {
		planMovie: orCallbacks.planMovie,
		reviseMovie: orCallbacks.reviseMovie,
		reviewMovie: orCallbacks.reviewMovie,
		generateAssetBrief: orCallbacks.generateAssetBrief
	};
}
