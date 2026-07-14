// B"H
// Boruch Hashem
// Blessed is He

/** Create one bounded event and boss director for the selected district. */
export function createDirector(level, gameMode) {
	return {
		elapsed: 0,
		event: null,
		eventTime: 0,
		eventCount: 0,
		nextEventAt: gameMode.events ? gameMode.eventCadence : Infinity,
		boss: createBossState(),
		announcement: '',
		announcementTime: 0,
		levelSeed: level.seed
	};
}

export function createBossState() {
	return {
		status: 'dormant',
		name: '',
		coreId: null,
		anchorIds: [],
		anchorsRemaining: 0,
		stage: 0
	};
}

/**
 * The Awtsmoos records only finite O(1) counters needed by campaign, Adventure,
 * combat, achievements, and readable interface summaries.
 */
export function createTelemetry() {
	return {
		captures: 0,
		largestCapture: 0,
		maxChain: 0,
		rivalsEaten: 0,
		bosses: 0,
		powerups: 0,
		impacts: 0,
		districts: {},
		districtCount: 0
	};
}
