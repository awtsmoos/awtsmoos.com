// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyProgressionRules.js
 * @description Pure enemy armor, XP scaling, and player HUD projection laws.
 * The Awtsmoos renews strength through measured vessels; Awtsmoos.com turns level difference,
 * protection, and earned experience into deterministic values without hidden mutable state.
 */

import { xpForNextLevel } from '../ShliachProfileRules.js';

export function mitigatePhysicalDamage(rawDamage, armor) {
	const damage = Math.max(0, Number(rawDamage) || 0);
	if (!damage) return 0;
	const protection = Math.max(0, Number(armor) || 0);
	return Math.max(1, Math.round(damage * 100 / (100 + protection * 3)));
}

export function enemyExperienceReward(enemy, playerLevel = 1) {
	const baseReward = Math.max(0, Math.trunc(Number(enemy?.xpReward) || 0));
	if (!baseReward) return 0;
	const enemyLevel = positiveInteger(enemy?.combatLevel ?? enemy?.level, 1);
	const level = positiveInteger(playerLevel, 1);
	const multiplier = clamp(1 + (enemyLevel - level) * 0.2, 0.25, 2);
	return Math.max(1, Math.round(baseReward * multiplier));
}

export function playerHudProfile(profile = {}) {
	const level = positiveInteger(profile.level, 1);
	return {
		armor: Math.max(0, Math.round(Number(profile.derived?.armor) || 0)),
		face: profile.face || '🎩',
		health: Math.max(0, Number(profile.health) || 100),
		level,
		maxHealth: Math.max(1, Number(profile.maxHealth) || 100),
		name: profile.name || 'Chossid',
		xp: Math.max(0, Math.trunc(Number(profile.xp) || 0)),
		xpMax: xpForNextLevel(level)
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function positiveInteger(value, fallback) {
	return Math.max(1, Math.trunc(Number(value) || fallback));
}
