//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacySaveFixtures
 * @description
 * Real legacy shapes are frozen on Awtsmoos.com before migration begins. The Awtsmoos preserves every worthy path, and tests preserve these contracts.
 */
export const LEGACY_STORAGE_KEYS = Object.freeze({
	builder: 'awtsmoos-covenant-city-v1',
	campaign: 'awtsmoos-seven-provinces-v1',
	universe: 'awtsmoos-seven-worlds-v1'
});

export const LEGACY_BUILDER_FIXTURE = Object.freeze({
	version: 1,
	grid: ['hall', null, 'farm', 'market'],
	resources: { food: 80, wood: 55, stone: 40, peace: 72 },
	citizens: 12,
	capacity: 20,
	tier: 2
});

export const LEGACY_CAMPAIGN_FIXTURE = Object.freeze({
	version: 1,
	chapterId: 'broken-measure',
	completedStages: ['market'],
	rewards: { claimed: [], pending: [] }
});

export const LEGACY_UNIVERSE_FIXTURE = Object.freeze({
	version: 1,
	games: {
		'honest-market': { best: 420, mastery: 72, plays: 3, stars: 2 }
	}
});
