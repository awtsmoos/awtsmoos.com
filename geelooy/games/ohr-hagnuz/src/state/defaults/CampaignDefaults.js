// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CampaignDefaults.js
 * @description Canonical durable roots for campaign, party, missions, economy, and world.
 *
 * A save begins as an empty vessel and receives every road without pretending
 * the road was always traveled. The Awtsmoos creates all memory anew each
 * instant; these defaults let earned choices endure truthfully at Awtsmoos.com.
 */

export const createCampaign = () => ({
	version: 1,
	started: false,
	chapterId: 'prologue',
	chapterIndex: 0,
	mainMissionId: 'prologue_broken_aleph',
	playMinutes: 0,
	ending: null,
	flags: {},
	chapterHistory: []
});

export const createParty = () => ({
	starterId: null,
	active: [],
	reserve: [],
	known: {},
	leadIndex: 0,
	maximumActive: 3,
	bond: {},
	evolutions: {},
	abilities: {},
	bondHistory: []
});

export const createMissions = () => ({
	active: {},
	completed: [],
	failed: [],
	flags: {},
	counters: {},
	history: [],
	companionLeads: {},
	pendingSceneId: null,
	pendingNextMissionId: null,
	autoActionKey: null,
	legacyActive: [],
	legacyCompleted: []
});

export const createScenes = () => ({
	activeId: null,
	lineIndex: 0,
	completed: {},
	choices: {},
	history: [],
	purpose: null
});

export const createEconomy = () => ({
	transactions: [],
	buyback: [],
	shopReputation: {},
	stockFlags: {},
	priceSeed: 1
});

export const createWorldState = () => ({
	time: { isShabbos: false, moonPhase: 1, timeOfDay: 'DAY' },
	weather: { type: 'CLEAR', intensity: 0 },
	purity: { level: 0, stepsRemaining: 0 },
	flags: {},
	legacyEtzChaim: {
		CHESED: 0,
		GEVURAH: 0,
		TIFERET: 0,
		NETZACH: 0,
		HOD: 0,
		YESOD: 0
	}
});
