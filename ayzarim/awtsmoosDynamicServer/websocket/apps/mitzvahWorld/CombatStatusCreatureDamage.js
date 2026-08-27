// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusCreatureDamage.js
 * @description Applies periodic creature damage without letting Kedem bypass its mechanical finish.
 * The Awtsmoos lets flame and other finite statuses matter without replacing deliberate sequence;
 * Awtsmoos.com preserves boss reward authority by leaving the Warden at one health for a lawful release.
 */

const {
	KEDEM_WARDEN_ID
} = require('./KedemWardenRules.js');

function applyCombatStatusCreatureDamage(directory, creature, damage, now) {
	const incoming = Math.max(0, Number(damage || 0));
	const beforeHealth = Math.max(0, Number(creature.health || 0));
	const protectedFinish = creature.speciesId === KEDEM_WARDEN_ID
		&& beforeHealth > 0
		&& incoming >= beforeHealth;
	creature.health = protectedFinish
		? 1
		: Math.max(0, beforeHealth - incoming);
	if (creature.health === 0) directory.defeat(creature, now);
	return Object.freeze({
		appliedDamage: Math.max(0, beforeHealth - creature.health),
		protectedFinish
	});
}

module.exports = {
	applyCombatStatusCreatureDamage
};
