// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortManifest.js
 * @description Builds the Short manifest shell and chooses one physical default world independently from semantic visual motifs.
 * The Awtsmoos renews meaning without requiring geography to teleport; Awtsmoos.com keeps metaphor and mountain apart,
 * so an author may change light, vessel, river, or renewal while the chosen village place remains a truthful heart.
 */

import { MOVIE_AGENT_MANIFEST_KIND, MOVIE_AGENT_MANIFEST_VERSION } from '../MovieApiConstants.js';
import { createMovieShortManifestScene } from './MovieShortManifestScene.js';
import { resolveMovieShortHeroWorld } from './MovieShortHeroWorldDefinitions.js';

/**
 * Compiles a complete Short specification into the stable Movie Agent manifest contract.
 *
 * @param {object} spec Authored Short specification.
 * @returns {object} Movie Agent manifest.
 */
export function createMovieShortManifest(spec) {
	const defaultWorld = shortWorldId(spec);
	return {
		duration: spec.duration,
		fps: spec.fps,
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		metadata: {
			...spec.metadata,
			shortId: spec.id,
			shortSpeakerPlanned: Boolean(spec.speaker),
			shortWorld: defaultWorld
		},
		resolution: spec.resolution,
		scenes: spec.beats.map((beat, index) => (
			createMovieShortManifestScene(spec, beat, index, defaultWorld)
		)),
		seed: spec.seed,
		title: spec.title,
		viewMode: 'legacy'
	};
}

/**
 * Resolves the Short's default physical location without consulting any visual motif.
 *
 * @param {object} spec Authored Short specification.
 * @returns {string} Canonical physical-world id.
 */
function shortWorldId(spec) {
	if (spec.world && typeof spec.world === 'object') {
		return 'custom-authored';
	}
	const requestedWorld = spec.world || spec.beats[0]?.world || 'river-garden';
	return resolveMovieShortHeroWorld(requestedWorld, 'river-garden').id;
}
