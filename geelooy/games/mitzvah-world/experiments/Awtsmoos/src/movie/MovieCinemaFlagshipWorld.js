// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipWorld.js
 * @description Declares one persistent village world with real river water, trees, paths, homes, and mountain horizon.
 * The Awtsmoos renews current, cedar, stone, and breeze before scenery receives a name;
 * Awtsmoos.com keeps one live world identity across six long scenes so nothing cinematic fakes the game.
 */

import { normalizeMovieWorldSpec } from './MovieWorldSpec.js';

export function createMovieCinemaFlagshipWorld() {
	return normalizeMovieWorldSpec({
		assets: [
			'assets/models/player/chossid.glb',
			'world/grass',
			'world/trees',
			'world/river-water',
			'world/village-buildings',
			'world/mountain-horizon'
		],
		atmosphere: {
			ambience: 'gentle village wind, river water, and distant birds',
			mood: 'contemplative',
			timeOfDay: 'golden-hour',
			weather: 'clear breezy'
		},
		camera: {
			energy: 'measured',
			preferredRigs: [
				'aerialPullback',
				'sideTrack',
				'craneReveal',
				'shoulder-left-cinema',
				'group-track-cinema',
				'final-mountain-cinema'
			],
			shotScale: 'cinematic'
		},
		id: 'cinema-flagship-village-613',
		label: 'Chassidic River Mountain Village',
		packageId: 'kedem-highlands',
		population: {
			crowd: 18,
			enemies: 0,
			npcs: 12,
			vegetation: 'dense grass, wind-swayed cedar trees, orchard, mountain shrubs'
		},
		prompt: [
			'peaceful Chassidic village with intact human figures',
			'real carved river and lake water beside grass fields and cedar trees',
			'orchard, stone paths, courtyard, wood and stone buildings',
			'distant mountains, gentle wind, no battle'
		].join(', '),
		quest: null,
		regionId: 'cedar-terraces',
		seed: 6132026
	});
}
