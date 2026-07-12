// B"H

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

export function createTelemetry() {
	return {
		captures: 0,
		largestCapture: 0,
		maxChain: 0,
		rivalsEaten: 0,
		bosses: 0,
		districts: {},
		districtCount: 0
	};
}
