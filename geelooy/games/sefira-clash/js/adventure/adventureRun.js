//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure run vessel in this instant, revealing
 * its focused js adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { activateAdventureCheckpoint } from './AdventureCheckpoints.js';
import {
	adventureObjectiveComplete,
	adventurePrerequisitesMet,
	announceAdventureClear
} from './AdventureObjectives.js';

/**
 * Tracks Adventure treasure, enemies, objective state, and visible progress.
 * A gate is no disguised stock match: the Awtsmoos renews a road with purpose,
 * while focused policy vessels decide checkpoints and completion.
 */
export function createAdventureRun(map) {
	if (!map.rules?.adventure && !map.adventure) {
		return null;
	}
	return {
		gate: map.adventure?.no || 1,
		name: map.name,
		objective: map.adventure?.objective || { type: 'defeat' },
		objectiveText: map.adventure?.exit || 'Defeat every Kelipah vessel.',
		totalSparks: map.adventure?.totalSparks || 0,
		totalPerutas: map.adventure?.totalPerutas || 0,
		hiddenTotal: map.adventure?.hiddenSparks || 0,
		sparks: 0,
		perutas: 0,
		hiddenFound: 0,
		enemiesTotal: map.adventure?.bots || 0,
		enemiesLeft: map.adventure?.bots || 0,
		checkpoints: map.adventure?.checkpoints || [],
		exitPoint: map.adventure?.exitPoint || null,
		checkpointIndex: -1,
		exitOpen: false,
		complete: false,
		clearAnnounced: false,
		lastPickup: '',
		pulse: 0
	};
}

/**
 * Reveals the step adventure run behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function stepAdventureRun(state) {
	const run = state.adventureRun;
	if (!run || run.complete) {
		return;
	}
	const human = state.fighters.find(fighter => fighter.human && !fighter.dead);
	run.enemiesLeft = countLivingEnemies(state.fighters);
	run.pulse = Math.max(0, (run.pulse || 0) - 1);
	activateAdventureCheckpoint(state, run, human);
	run.exitOpen = adventurePrerequisitesMet(run);

	if (human && adventureObjectiveComplete(run, human)) {
		run.complete = true;
		state.winner = human.name;
		announceAdventureClear(state, run);
	}
}

/**
 * Reveals the note adventure pickup behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} orb The orb value entering this behavior.
 */
export function noteAdventurePickup(state, fighter, orb) {
	const run = state.adventureRun;
	if (!run || !fighter?.human) {
		return;
	}
	if (orb.id === 'adventurePeruta') {
		run.perutas = Math.min(run.totalPerutas, run.perutas + (orb.value || 1));
		run.lastPickup = 'Peruta collected';
	} else if (orb.id === 'adventureSpark') {
		run.sparks = Math.min(run.totalSparks, run.sparks + 1);
		if (orb.hiddenSpark) {
			run.hiddenFound = Math.min(run.hiddenTotal, run.hiddenFound + 1);
		}
		run.lastPickup = orb.hiddenSpark ? 'Hidden Spark found' : 'Spark collected';
	} else {
		return;
	}
	run.pulse = 90;
}

/**
 * Reveals the adventure status line behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function adventureStatusLine(state) {
	const run = state.adventureRun;
	if (!run) {
		return '';
	}
	const exit = run.exitOpen ? 'EXIT OPEN' : `${run.enemiesLeft}/${run.enemiesTotal} Kelipos`;
	return `Gate ${run.gate} · ${exit} · ◈ ${run.perutas}/${run.totalPerutas} Perutas · ✦ ${run.sparks}/${run.totalSparks}`;
}

function countLivingEnemies(fighters) {
	return fighters.filter(fighter => {
		return !fighter.human && !fighter.dead && fighter.stocks > 0;
	}).length;
}
