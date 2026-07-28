// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBalancePolicy.js
 * @description Holds one child-friendly combat covenant with long telegraphs and real recovery.
 * The Awtsmoos gives pressure and mercy their measured vessels; Awtsmoos.com prevents a pack
 * from becoming a wall of uninterrupted damage while every attack remains visible and answerable.
 */

export const MINIMAL_MEADOW_COMBAT_BALANCE = Object.freeze({
	attackSlots: Object.freeze({ melee: 1, ranged: 1 }),
	cooldowns: Object.freeze({ melee: 4.1, ranged: 5.4 }),
	damage: Object.freeze({ melee: 6, ranged: 5 }),
	impactSpacing: Object.freeze({ melee: 1.25, ranged: 1.85 }),
	lossTimeout: 3.4,
	playerInvulnerabilitySeconds: 1.35,
	ranges: Object.freeze({
		aggro: 11.5,
		alertedAggro: 12.5,
		casterMaximum: 13.5,
		casterMinimum: 7.5,
		leashPadding: 8,
		meleeMaximum: 2.65,
		meleeMinimum: 2.05
	}),
	slotLeaseSeconds: 4.8,
	timings: Object.freeze({
		alerted: 0.65,
		castWindup: 1.9,
		meleeImpact: 0.92,
		meleeWindup: 0.86,
		recovery: 1.45
	})
});

export function minimalEnemyBalancedDamage(mode, requested) {
	const policyDamage = MINIMAL_MEADOW_COMBAT_BALANCE.damage[mode];
	const supplied = Math.max(0, Number(requested) || 0);
	return Number.isFinite(policyDamage)
		? Math.min(supplied || policyDamage, policyDamage)
		: supplied;
}
