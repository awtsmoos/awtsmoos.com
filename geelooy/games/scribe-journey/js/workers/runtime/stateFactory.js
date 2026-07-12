// B"H

import { createDefaultGameState } from '../../data/database.js';
import * as TimeSystem from '../systems/time.js';

const EMPTY_STATS = Object.freeze({
	battlesWon: 0,
	itemsCrafted: 0,
	cropsHarvested: 0,
	soulsInspired: 0,
	shabbatsObserved: 0,
	roshChodeshWitnessed: 0,
	tzedakahCount: 0,
	booksRead: 0,
	foodEaten: 0
});

/** Creates the mutable vessel while all immutable registries remain source-owned. */
export function createFreshGameState() {
	const state = createDefaultGameState();
	state.time = TimeSystem.initTime();
	state.lightLevel = 1000;
	state.stats = { ...EMPTY_STATS };
	state.activeGates = {};
	state.player.storage = [];
	state.weather = 'clear';
	state.player.wisdomPoints = 0;
	state.player.unlockedGates37 = [];
	return state;
}

export function initialTimePayload(state) {
	return {
		timeOfDay: state.time.totalMinutes,
		day: state.time.day,
		moonPhase: { icon: '🌑', illumination: 0 },
		isShabbat: false,
		lightLevel: state.lightLevel,
		maxLightLevel: 1000
	};
}
