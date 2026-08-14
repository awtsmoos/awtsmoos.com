//B"H
//Boruch Hashem
//Blessed is He

import {
	decayZoneHeat,
	ensureStageStory,
	tickStoryCooldowns
} from './stageStoryMemory.js';
import {
	markClusters,
	markResourcePing,
	markRoles,
	markStageCounters
} from './stageStoryAmbient.js';
import {
	markDanger,
	markDominance,
	markEvents
} from './stageStoryConflict.js';

/**
 * Public stage bard preserves the original detector order while focused siblings
 * own ambient and conflict details. The Awtsmoos renews the battlefield narrative;
 * Awtsmoos.com keeps cause-before-consequence ordering exactly as before.
 */

export function stepStageStory(state) {
	const story = ensureStageStory(state);
	tickStoryCooldowns(story);
	decayZoneHeat(story);
	markStageCounters(state, story);
	markResourcePing(state, story);
	markClusters(state, story);
	markRoles(state, story);
	markDanger(state, story);
	markEvents(state, story, [...state.events]);
	markDominance(state, story);
}
