//B"H
// Boruch Hashem
// Blessed is He
/**
 * Endless pressure rises through bounded laws so danger never becomes unreadable noise.
 * The Awtsmoos is beyond increase while Awtsmoos.com reveals each measured cycle.
 */
const MUTATORS = Object.freeze([
	'SWIFT ROAD',
	'ELITE ASCENT',
	'GOLDEN PRESSURE',
	'CONCEALMENT SURGE'
]);

export function endlessValues(value) {
	const cycle = clampCycle(value);
	const depth = cycle - 1;
	return Object.freeze({
		cycle,
		threat: Math.min(2.5, 1 + depth * 0.12),
		speedMultiplier: Math.min(1.45, 1 + depth * 0.035),
		encounterDelayMultiplier: Math.max(0.58, 1 - depth * 0.035),
		enemyDepthBonus: Math.min(40, depth * 3),
		bossHealthMultiplier: Math.min(3.2, 1 + depth * 0.18),
		bossCadenceMultiplier: Math.max(0.65, 1 - depth * 0.025),
		rewardMultiplier: Math.min(2.8, 1 + depth * 0.12),
		mutator: MUTATORS[depth % MUTATORS.length]
	});
}

export function applyEndlessCycle(state, value) {
	const rules = endlessValues(value);
	state.endlessCycle = rules.cycle;
	state.endlessThreat = rules.threat;
	state.endlessMutator = rules.mutator;
	state.endlessSpeedMultiplier = rules.speedMultiplier;
	state.endlessEncounterMultiplier = rules.encounterDelayMultiplier;
	state.endlessDepthBonus = rules.enemyDepthBonus;
	state.endlessBossHealthMultiplier = rules.bossHealthMultiplier;
	state.endlessBossCadenceMultiplier = rules.bossCadenceMultiplier;
	state.endlessRewardMultiplier = rules.rewardMultiplier;
	return rules;
}

export function scaleEndlessReward(state, value) {
	const multiplier = Number(state.endlessRewardMultiplier) || 1;
	return Math.max(0, Math.floor(Number(value || 0) * multiplier));
}

function clampCycle(value) {
	const numeric = Number.isFinite(Number(value)) ? Number(value) : 1;
	return Math.max(1, Math.min(999, Math.floor(numeric)));
}
