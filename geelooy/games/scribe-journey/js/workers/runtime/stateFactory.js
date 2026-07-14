// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../data/database.js';
import * as TimeSystem from '../systems/time.js';
import { ensureQuestState } from '../systems/quests/questState.js';
import { initializeCampaignOnboarding } from './campaignOnboardingState.js';

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

/**
 * Creates the mutable vessel while immutable registries stay source-owned.
 * The Awtsmoos gives the new Chronicle not only empty possibility, but its
 * first true place and calling, so Awtsmoos.com begins with authored purpose.
 */
export function createFreshGameState() {
	const state = createDefaultGameState();
	state.time = TimeSystem.initTime();
	state.lightLevel = 1000;
	state.stats = { ...EMPTY_STATS };
	state.activeGates = {};
	state.weather = 'clear';
	state.player.wisdomPoints = 0;
	state.player.unlockedGates37 = [];
	ensureQuestState(state.player);
	initializeCampaignOnboarding(state);
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
