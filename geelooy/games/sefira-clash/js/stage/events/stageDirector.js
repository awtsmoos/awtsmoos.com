//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stage director vessel in this instant, revealing
 * its focused js stage events service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { updateStageMood } from './stageMood.js';
import { maybeSpawnStageItem } from '../items/itemSpawner.js';
import { maybeSpawnHazard } from '../hazards/hazardSpawner.js';
import { stepHazards } from '../hazards/hazardState.js';
import { stepBattlefieldScars } from '../scars/battlefieldScars.js';
import { stepObjectiveDirector } from '../objectives/objectiveDirector.js';
import { stepStageStory } from '../narrative/stageStoryEvents.js';
import { mapRuleModifiers } from '../../maps/mapSpecificRules.js';

/**
 * B"H
 * Living battlefield director with map-specific tempo.
 *
 * Chapter 72: the director now hears the map itself. Quiet Pinball gets restless
 * faster, Vast summons objectives sooner, and the bard finally gets a turn.
 */
export function createStageDirector() {
	return {
		itemCooldown: 360,
		hazardCooldown: 600,
		objectiveCooldown: 420,
		itemsSpawned: 0,
		itemsPickedUp: 0,
		hazardsSpawned: 0,
		hazardHits: 0,
		objectiveSpawns: 0,
		objectiveClaims: 0,
		storyBeats: 0
	};
}

/**
 * Reveals the step stage director behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function stepStageDirector(state) {
	state.stageDirector ||= createStageDirector();
	const mood = updateStageMood(state);
	applyMapTempo(state, mood);
	maybeSpawnStageItem(state);
	maybeSpawnHazard(state);
	stepHazards(state);
	stepObjectiveDirector(state);
	stepStageStory(state);
	countStoryBeats(state);
	stepBattlefieldScars(state);
}

function applyMapTempo(state, mood) {
	const m = mapRuleModifiers(state.map);
	if (m.objectiveCooldownScale < 1 && mood.quietFrames % 120 === 0)
		state.stageDirector.objectiveCooldown = Math.min(
			state.stageDirector.objectiveCooldown || 999,
			Math.round(520 * m.objectiveCooldownScale)
		);
	if (m.storyTempo > 1 && mood.violence > 60)
		state.stageDirector.hazardCooldown = Math.min(
			state.stageDirector.hazardCooldown || 999,
			360
		);
}

function countStoryBeats(state) {
	let beats = 0;
	for (const e of state.events || []) if (e.storyBeat) beats++;
	state.stageDirector.storyBeats = (state.stageDirector.storyBeats || 0) + beats;
}
