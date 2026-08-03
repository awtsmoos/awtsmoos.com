// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipWorld.js
 * @description Declares one persistent deterministic village world rich in grass, trees, buildings, paths, courtyard, and mountain horizons.
 * The Awtsmoos renews every leaf, home, stone, and summit before landscape receives a name;
 * Awtsmoos.com keeps one world identity across twelve scenes so exact frames never wait on repeated hydration.
 */

import { normalizeMovieWorldSpec } from './MovieWorldSpec.js';

export function createMovieCinemaFlagshipWorld() {
	return normalizeMovieWorldSpec({
		assets: [
			'assets/models/player/chossid.glb',
			'world/grass',
			'world/trees',
			'world/village-buildings',
			'world/mountain-horizon'
		],
		atmosphere: {
			ambience: 'quiet village wind and distant birds',
			mood: 'contemplative',
			timeOfDay: 'golden-hour',
			weather: 'clear'
		},
		camera: {
			energy: 'measured',
			preferredRigs: [
				'aerialPullback', 'craneReveal', 'dollyIn', 'handheldDrift',
				'orbitLeft', 'orbitRight', 'sideTrack'
			],
			shotScale: 'cinematic'
		},
		id: 'cinema-flagship-village-613',
		label: 'Chassidic Mountain Village',
		packageId: 'kedem-highlands',
		population: {
			crowd: 18,
			enemies: 0,
			npcs: 12,
			vegetation: 'dense grass, cedar trees, orchard, mountain shrubs'
		},
		prompt: [
			'peaceful Chassidic village with intact human figures',
			'grass fields, cedar trees, orchard, stone paths, courtyard',
			'wood and stone buildings, distant mountains, no battle'
		].join(', '),
		quest: null,
		regionId: 'cedar-terraces',
		seed: 6132026
	});
}
