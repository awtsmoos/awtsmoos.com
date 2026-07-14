// B"H
// Boruch Hashem
// Blessed is He
/** @module DefaultReleaseTrains @description Materializes twelve independent review and evidence boundaries. */
import { createReleaseTrain } from './trainManifest.mjs';

const definitions = [
	['release', 'Release Safety', [1, 2, 3, 4, 5]],
	['core', 'Core Objects', [6, 7, 8, 9, 10]],
	['provenance', 'Provenance', [11, 12, 13, 14, 15]],
	['social', 'Rich Social', [16, 17, 18, 19, 20]],
	['discovery', 'Discovery', [21, 22, 23, 24, 25]],
	['search', 'Search and Vectors', [26, 27, 28, 29, 30]],
	['worlds', 'Published Worlds', [31, 32, 33, 34, 35]],
	['characters', 'Character Authority', [36, 37, 38, 39, 40]],
	['replays', 'Replays and Cinema', [41, 42, 43, 44, 45]],
	['artifacts', 'Artifact Laboratories', [46, 47, 48, 49, 50]],
	['tunnel', 'Tunnel Control', [51, 52, 53, 54, 55]],
	['integration', 'Creator–World Integration', [56, 57, 58, 59, 60]]
];

export const DEFAULT_RELEASE_TRAINS = Object.freeze(definitions.map(([id, name, chapters]) => {
	return createReleaseTrain({
		id,
		name,
		chapters,
		owners: [`creator-world-os:${id}`],
		artifacts: ['source', 'test', 'evidence'],
		dependsOn: dependencyFor(id)
	});
}));

export function defaultReleaseTrain(id) {
	return DEFAULT_RELEASE_TRAINS.find(train => train.id === id) || null;
}

function dependencyFor(id) {
	if (id === 'release') return [];
	if (id === 'core') return ['release'];
	if (id === 'integration') return definitions.slice(0, -1).map(([trainId]) => trainId);
	return ['release', 'core'];
}
