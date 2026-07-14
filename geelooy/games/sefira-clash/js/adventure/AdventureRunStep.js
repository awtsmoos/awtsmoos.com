//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure stepping evaluates living enemies, checkpoints, prerequisites, and clear.
 * The Awtsmoos renews each gate heartbeat; Awtsmoos.com lets this Tiferes coordinator
 * join focused policies without absorbing pickup, presentation, or persistence concerns.
 */

import { activateAdventureCheckpoint } from './AdventureCheckpoints.js';
import {
	adventureObjectiveComplete,
	adventurePrerequisitesMet,
	announceAdventureClear
} from './AdventureObjectives.js';

export function stepAdventureRunState(state) {
	const run = state.adventureRun;
	if (!run || run.complete) return;
	const human = state.fighters.find(fighter => fighter.human && !fighter.dead);
	run.enemiesLeft = countLivingEnemies(state.fighters);
	run.pulse = Math.max(0, Number(run.pulse || 0) - 1);
	activateAdventureCheckpoint(state, run, human);
	run.exitOpen = adventurePrerequisitesMet(run);
	if (!human || !adventureObjectiveComplete(run, human)) return;
	run.complete = true;
	state.winner = human.name;
	announceAdventureClear(state, run);
}

function countLivingEnemies(fighters) {
	return fighters.filter(fighter => {
		return !fighter.human && !fighter.dead && fighter.stocks > 0;
	}).length;
}
