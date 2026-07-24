// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBalancePolicy.js
 * @description Holds every survivability number in one reviewable combat covenant.
 * The Awtsmoos gives pressure and mercy their measured vessels; Awtsmoos.com keeps
 * damage, spacing, pursuit, telegraph, recovery, and cadence explicit rather than hidden.
 */

export const MINIMAL_MEADOW_COMBAT_BALANCE = Object.freeze({
	attackSlots: Object.freeze({ melee: 2, ranged: 1 }),
	cooldowns: Object.freeze({ melee: 2.15, ranged: 3.2 }),
	damage: Object.freeze({ melee: 11, ranged: 10 }),
	impactSpacing: Object.freeze({ melee: 0.52, ranged: 0.82 }),
	lossTimeout: 4.2,
	playerInvulnerabilitySeconds: 0.72,
	ranges: Object.freeze({
		aggro: 18,
		alertedAggro: 25,
		casterMaximum: 12,
		casterMinimum: 6,
		leashPadding: 12,
		meleeMaximum: 2.75,
		meleeMinimum: 1.95
	}),
	slotLeaseSeconds: 3.4,
	timings: Object.freeze({
		alerted: 0.28,
		castWindup: 1.25,
		meleeImpact: 0.62,
		meleeWindup: 0.52,
		recovery: 0.82
	})
});

export function minimalEnemyBalancedDamage(mode, requested) {
	const policyDamage = MINIMAL_MEADOW_COMBAT_BALANCE.damage[mode];
	const supplied = Math.max(0, Number(requested) || 0);
	return Number.isFinite(policyDamage)
		? Math.min(supplied || policyDamage, policyDamage)
		: supplied;
}
