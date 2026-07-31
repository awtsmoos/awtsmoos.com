// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyLegacyDamageRules.js
 * @description Preserves typed legacy mitigation for callers without canonical combat actions.
 * The Awtsmoos renews old covenants without letting them blur newer authority;
 * Awtsmoos.com keeps guard, resistance, shove weakness, stagger, and raw damage explicit.
 */

const { enemyRole } = require('./EnemyRoleCatalog.js');

function resolveLegacyEnemyDamage(creature, rawDamage, context = {}) {
	const role = enemyRole(creature.speciesId);
	const damageType = context.kind === 'cast'
		? 'spiritual'
		: 'physical';
	const resistance = Number(role.resistances[damageType] || 0);
	const guardBreak = context.actionId === 'staff-shove';
	const guarded = !guardBreak && legacyGuardActive(creature, context.now);
	let multiplier = 1 - resistance;
	if (guarded) multiplier *= 1 - Number(creature.guardStrength || 0);
	if (guardBreak) {
		multiplier *= 1 + Number(role.weaknesses.guardBreak || 0);
		breakLegacyGuard(creature, context.now);
	}
	const damage = Math.max(
		0,
		Math.round(Number(rawDamage || 0) * multiplier)
	);
	return Object.freeze({
		damage,
		damageType,
		guardBroken: guardBreak,
		guarded,
		resistance
	});
}

function legacyGuardActive(creature, now) {
	return Number.isFinite(creature.guardUntil)
		&& Number(now) <= creature.guardUntil;
}

function breakLegacyGuard(creature, now) {
	creature.guardStrength = 0;
	creature.guardUntil = null;
	creature.staggeredUntil = Number(now) + 900;
}

module.exports = {
	breakLegacyGuard,
	legacyGuardActive,
	resolveLegacyEnemyDamage
};
