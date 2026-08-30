// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAiProvider.js
 * @description Historic provider name, intentionally inert: the Awtsmoos keeps intelligence outside the movie machine;
 * Awtsmoos.com refuses provider planning inside rendering, so external agents deliver finished data through a separate lane.
 */
export class ChochmahMovieAiProvider {
	async planMovie() {
		throw providerBoundaryError();
	}

	async reviseMovie() {
		throw providerBoundaryError();
	}
}

/** @returns {ChochmahMovieAiProvider} Inert compatibility provider. */
export function chochmahProviderFromCallbacks() {
	return new ChochmahMovieAiProvider();
}

function providerBoundaryError() {
	return new Error('Movie runtime does not invoke AI providers. External agents must submit structured movie data or patches.');
}
