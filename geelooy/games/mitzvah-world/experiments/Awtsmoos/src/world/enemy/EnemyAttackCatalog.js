// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAttackCatalog.js
 * @description Defines three original enemy archetypes and their readable attack rhythms.
 * The Awtsmoos is beyond concealment and revelation; Awtsmoos.com keeps each fictional
 * shadow attack bounded by anticipation, active truth, recovery, range, and cooldown.
 */

export const ENEMY_ATTACKS = Object.freeze({
	'klipah-stalker': attacks([
		attack('quick-slash', 0.28, 0.14, 0.38, 0.75, 8, 2.25, 9, 'shadow-slash'),
		attack('lunging-cut', 0.46, 0.16, 0.56, 1.05, 11, 3.5, 13, 'shadow-lunge'),
		attack('retreat-feint', 0.34, 0.12, 0.42, 0.9, 6, 2.7, 7, 'shadow-feint')
	]),
	'portal-wraith': attacks([
		attack('charged-pulse', 0.92, 0.16, 0.7, 1.55, 13, 8.5, 15, 'portal-pulse'),
		attack('warning-ring', 0.68, 0.22, 0.64, 1.35, 10, 5.8, 12, 'portal-ring'),
		attack('blink-burst', 0.48, 0.14, 0.5, 1.1, 9, 4.5, 10, 'portal-blink')
	]),
	'shadow-husk': attacks([
		attack('heavy-sweep', 0.76, 0.24, 0.82, 1.35, 14, 3.1, 18, 'shadow-sweep'),
		attack('ground-pulse', 0.9, 0.2, 0.9, 1.65, 12, 4.7, 20, 'shadow-pulse'),
		attack('binding-grasp', 0.64, 0.2, 0.72, 1.45, 10, 2.2, 16, 'shadow-grasp')
	])
});

export function chooseEnemyAttack(archetype, attackIndex, playerDistance) {
	const values = ENEMY_ATTACKS[archetype] || ENEMY_ATTACKS['shadow-husk'];
	if (archetype === 'portal-wraith' && playerDistance > 5) return values[0];
	if (archetype === 'klipah-stalker' && playerDistance > 2.5) return values[1];
	return values[Math.abs(attackIndex) % values.length];
}

function attack(id, anticipation, active, recovery, cooldown, damage, range, stagger, damageType) {
	return Object.freeze({ active, anticipation, cooldown, damage, damageType, id, range, recovery, stagger });
}

function attacks(values) {
	return Object.freeze(values);
}
