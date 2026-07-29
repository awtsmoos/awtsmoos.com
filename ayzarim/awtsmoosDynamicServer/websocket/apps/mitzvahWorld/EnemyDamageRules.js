// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyDamageRules.js
 * @description Applies enemy resistance, guard, guard break, and weakness metadata.
 * The Awtsmoos renews force through bounded vessels; Awtsmoos.com distinguishes physical
 * and spiritual impact while a real shove may break guard and create a readable stagger.
 */

const { enemyRole } = require('./EnemyRoleCatalog.js');

function resolveEnemyDamage(creature, rawDamage, context = {}) {
	const role = enemyRole(creature.speciesId);
	const damageType = context.kind === 'cast' ? 'spiritual' : 'physical';
	const resistance = Number(role.resistances[damageType] || 0);
	const guardBreak = context.actionId === 'staff-shove';
	const guarded = !guardBreak && guardActive(creature, context.now);
	let multiplier = 1 - resistance;
	if (guarded) multiplier *= 1 - Number(creature.guardStrength || 0);
	if (guardBreak) multiplier *= 1 + Number(role.weaknesses.guardBreak || 0);
	const damage = Math.max(0, Math.round(Number(rawDamage || 0) * multiplier));
	if (guardBreak) breakGuard(creature, context.now);
	return Object.freeze({
		damage,
		damageType,
		guardBroken: guardBreak,
		guarded,
		resistance
	});
}

function guardActive(creature, now) {
	return Number.isFinite(creature.guardUntil)
		&& Number(now) <= creature.guardUntil;
}

function breakGuard(creature, now) {
	creature.guardStrength = 0;
	creature.guardUntil = null;
	creature.staggeredUntil = Number(now) + 900;
}

module.exports = {
	resolveEnemyDamage
};
