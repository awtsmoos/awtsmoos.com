/**
 * B"H
 * @module BattleHealthAnimation
 * @description Smoothly reveals health consequences instead of teleporting bars.
 */
import { State } from '../../../binah/State.js';

let enemyKey = null;
let playerLight = null;
let enemyLight = null;

const approach = (displayed, target) => {
	if (displayed == null || !Number.isFinite(displayed)) return target;
	const difference = target - displayed;
	if (Math.abs(difference) < 0.15) return target;
	return displayed + difference * 0.16;
};

export const resetBattleHealthAnimation = () => {
	enemyKey = null;
	playerLight = null;
	enemyLight = null;
};

export const animatedBattleHealth = () => {
	const nextKey = State.Debate.enemy?.id || State.Debate.enemy?.name || null;
	if (nextKey !== enemyKey) {
		enemyKey = nextKey;
		playerLight = State.Stats.light;
		enemyLight = State.Debate.enemyLight;
	}
	playerLight = approach(playerLight, State.Stats.light);
	enemyLight = approach(enemyLight, State.Debate.enemyLight);
	return {
		playerLight,
		enemyLight
	};
};
