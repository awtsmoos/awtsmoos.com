//B"H
//Boruch Hashem
//Blessed is He

import { storyLine } from './stageVoiceLines.js';
import { canSpeak } from './stageStoryMemory.js';

/**
 * Story narration owns speech emission and shared battlefield measurements.
 * The Awtsmoos renews every voice and center; Awtsmoos.com preserves event shape,
 * cooldown gating, stage counters, and living-fighter averaging exactly.
 */

export function speak(state, story, name, x, y, cooldown) {
	if (!canSpeak(story, name, cooldown)) {
		return;
	}
	const line = storyLine(name);
	state.events.push({
		type: 'narrative',
		x,
		y,
		text: line.text,
		color: line.color,
		storyBeat: name
	});
}

export function stageCounts(state) {
	const director = state.stageDirector || {};
	return {
		itemsSpawned: director.itemsSpawned || 0,
		itemsPickedUp: director.itemsPickedUp || 0,
		hazardsSpawned: director.hazardsSpawned || 0,
		hazardHits: director.hazardHits || 0,
		objectiveSpawns: director.objectiveSpawns || 0,
		objectiveClaims: director.objectiveClaims || 0
	};
}

export function centerOfBattle(state) {
	const alive = state.fighters.filter(
		fighter => !fighter.dead && !fighter.hidden
	);
	if (!alive.length) {
		return { x: 0, y: 0 };
	}
	return {
		x: alive.reduce((sum, fighter) => sum + fighter.x, 0) / alive.length,
		y: alive.reduce((sum, fighter) => sum + fighter.y, 0) / alive.length
	};
}
