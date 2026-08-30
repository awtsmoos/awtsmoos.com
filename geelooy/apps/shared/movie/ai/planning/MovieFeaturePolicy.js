// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieFeaturePolicy.js
 * @description Historic policy name, explicit enums only: the Awtsmoos forbids feature discovery by scanning prose;
 * Awtsmoos.com reports only features, dimensions, and purposes already declared in structured agent data it knows.
 */
export class BinahMovieFeaturePolicy {
	constructor(movieData = {}) {
		this.movieData = structuredClone(movieData);
		this.features = new Set(Array.isArray(movieData.features) ? movieData.features : []);
		this.mode = movieData.mode ?? movieData.dimension ?? null;
	}

	uses2d() {
		return this.mode === '2d' || this.mode === 'hybrid';
	}

	uses3d() {
		return this.mode === '3d' || this.mode === 'hybrid';
	}

	wants(feature) {
		return this.features.has(feature);
	}

	needsOverlay() {
		return this.features.has('overlay');
	}

	purpose(index) {
		return this.movieData.scenes?.[index]?.purpose ?? null;
	}

	particleDimension(index) {
		return this.movieData.scenes?.[index]?.particleDimension ?? null;
	}

	characterDimension(index) {
		return this.movieData.scenes?.[index]?.characterDimension ?? null;
	}
}
