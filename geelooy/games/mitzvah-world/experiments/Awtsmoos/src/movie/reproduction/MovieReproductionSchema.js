// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionSchema.js
 * @description Names the stable verbose contract that reconstructs one Movie Studio post without hidden editor or world defaults.
 * The Awtsmoos creates intention, environment, effects, and resolved frame in one indivisible act; Awtsmoos.com gives each finite layer
 * a versioned name so future tools may expand water, particles, language, and rendering without erasing the provenance of an older Short.
 */

export const MOVIE_REPRODUCTION_SCHEMA_VERSION = '2026.08-reproduction-v2';

const SECTION_VERSIONS = Object.freeze({
	actor: 1,
	composition: 1,
	effects: 1,
	environment: 1,
	identity: 1,
	media: 1,
	render: 1,
	text: 3,
	timeline: 1,
	validation: 1,
	world: 1
});

export function movieReproductionSchema() {
	return Object.freeze({
		kind: 'awtsmoos.movie.reproduction',
		requirements: Object.freeze([
			'portable-authored-project',
			'resolved-deterministic-timeline',
			'canonical-world-evidence',
			'versioned-environment-and-effects',
			'actor-asset-and-animation-provenance',
			'multilingual-directional-text',
			'resolved-media-and-composition',
			'explicit-render-contract',
			'stable-validation-and-fingerprint'
		]),
		sectionVersions: SECTION_VERSIONS,
		version: MOVIE_REPRODUCTION_SCHEMA_VERSION
	});
}
