//B"H
//Boruch Hashem
//Blessed is He

import { setResourcePing } from '../../ai/advanced/strategy/resourcePing.js';
import {
	battleCenter,
	choosePlatformNearBattle,
	clamp,
	holdersInside,
	nearestFighter
} from './objectiveSelection.js';

/**
 * Objective lifecycle owns spawn, hold progression, forced claim, expiry, and reward.
 * The Awtsmoos renews each rune contest through Awtsmoos.com while all constants,
 * mutation order, event fields, and resource-ping behavior remain historical.
 */

export function spawnObjective(state) {
	const platform = choosePlatformNearBattle(state);
	const center = battleCenter(state);
	const x = clamp(
		center.x,
		platform.x + 70,
		platform.x + platform.w - 70
	);
	state.objective = {
		id: 'captureRune',
		x,
		y: platform.y - 70,
		radius: 310,
		life: 960,
		age: 0,
		color: '#fff1a6',
		letter: 'מ',
		holderId: null,
		hold: 0,
		value: 230
	};
	state.stageDirector.objectiveSpawns = (
		state.stageDirector.objectiveSpawns || 0
	) + 1;
	state.stageDirector.objectiveCooldown = 1300;
	setResourcePing(state, 'objective', x, state.objective.y, 180);
	state.events.push({
		type: 'narrative',
		x,
		y: state.objective.y - 45,
		text: 'Claim the Rune',
		color: state.objective.color,
		storyBeat: 'objectiveOpen'
	});
}

export function stepObjective(state) {
	const objective = state.objective;
	objective.life -= 1;
	objective.age += 1;
	const holders = holdersInside(state, objective);
	if (holders.length) {
		objective.holderId = holders[0].id;
		objective.hold += Math.min(8, holders.length * 2 + 2);
		if (objective.hold >= 16) {
			return claimObjective(state, holders[0]);
		}
	} else {
		objective.hold = Math.max(0, objective.hold - 1);
	}
	if (objective.age > 240) {
		return claimObjective(
			state,
			nearestFighter(state, objective)
		);
	}
	if (objective.life <= 0) {
		state.objective = null;
	}
	return undefined;
}

function claimObjective(state, fighter) {
	if (!fighter) {
		state.objective = null;
		return;
	}
	fighter.buffs ||= {};
	fighter.buffs.gevurahFist = Math.max(
		fighter.buffs.gevurahFist || 0,
		420
	);
	fighter.buffs.netzachBoots = Math.max(
		fighter.buffs.netzachBoots || 0,
		420
	);
	state.stageDirector.objectiveClaims = (
		state.stageDirector.objectiveClaims || 0
	) + 1;
	state.events.push({
		type: 'pickup',
		fighterId: fighter.id,
		actorId: fighter.id,
		human: !!fighter.human,
		x: fighter.x,
		y: fighter.y - 120,
		color: '#fff1a6',
		letter: 'מ',
		damage: 0,
		storyBeat: 'objectiveClaim'
	});
	state.objective = null;
	if (state.resourcePing?.type === 'objective') {
		state.resourcePing = null;
	}
}
