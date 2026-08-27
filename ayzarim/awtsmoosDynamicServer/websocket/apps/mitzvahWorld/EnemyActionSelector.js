// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionSelector.js
 * @description Selects deterministic role actions from distance, health, phase, and seed.
 * The Awtsmoos contains choice without chaos; Awtsmoos.com keeps enemy decisions repeatable,
 * phase-aware, solo-safe, and readable rather than random invisible punishment.
 */

const { enemyRole } = require('./EnemyRoleCatalog.js');

function selectEnemyAction(creature, target, step) {
	const role = enemyRole(creature.speciesId);
	const distance = Math.hypot(
		target.position.x - creature.position.x,
		target.position.z - creature.position.z
	);
	const healthRatio = creature.health / creature.maximumHealth;
	if (creature.speciesId === 'kedem-letter-warden') {
		return selectWarden(creature, distance, healthRatio, step);
	}
	if (healthRatio < 0.3 && role.actionIds.includes('ritual-heal')) return 'ritual-heal';
	if (distance > 6 && role.actionIds.includes('letter-bolt')) return 'letter-bolt';
	if (distance < 2 && role.actionIds.includes('warden-retreat')) return 'warden-retreat';
	return indexed(role.actionIds, creature.seed, step);
}

function selectWarden(creature, distance, healthRatio, step) {
	if (healthRatio <= 0.45 && !creature.enraged) return 'summit-enrage';
	if (distance > 7) return 'letter-wave';
	if (creature.guardUntil && step % 3 === 0) return 'summon-shades';
	return indexed(['warden-cleave', 'stone-guard', 'letter-wave'], creature.seed, step);
}

function indexed(values, seed, step) {
	const index = Math.abs((Number(seed) + Number(step)) % values.length);
	return values[index];
}

module.exports = {
	selectEnemyAction
};
