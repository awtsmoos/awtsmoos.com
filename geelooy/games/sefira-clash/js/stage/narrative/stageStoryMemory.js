//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stage story memory keeps creation and speech cooldowns at the historic import path
 * while rivalry and zone signals live in a focused sibling. The Awtsmoos renews
 * arena memory through Awtsmoos.com without changing any public export contract.
 */

export function createStageStoryMemory() {
	return {
		cooldown: 0,
		danger: new Set(),
		rivalHits: {},
		lastAttacker: {},
		zoneHeat: {},
		lastCounts: {
			itemsSpawned: 0,
			itemsPickedUp: 0,
			hazardsSpawned: 0,
			hazardHits: 0,
			objectiveSpawns: 0,
			objectiveClaims: 0
		},
		beats: 0,
		callouts: {}
	};
}

export function ensureStageStory(state) {
	state.story ||= createStageStoryMemory();
	return state.story;
}

export function canSpeak(story, key, cooldown = 140) {
	story.callouts[key] = Math.max(
		0,
		(story.callouts[key] || 0) - 1
	);
	if (story.cooldown > 0 || story.callouts[key] > 0) {
		return false;
	}
	story.cooldown = 38;
	story.callouts[key] = cooldown;
	story.beats += 1;
	return true;
}

export function tickStoryCooldowns(story) {
	story.cooldown = Math.max(0, story.cooldown - 1);
	for (const key of Object.keys(story.callouts)) {
		story.callouts[key] = Math.max(
			0,
			story.callouts[key] - 1
		);
	}
}

export {
	recordRivalHit,
	recordZoneHeat,
	decayZoneHeat
} from './stageStorySignals.js';
