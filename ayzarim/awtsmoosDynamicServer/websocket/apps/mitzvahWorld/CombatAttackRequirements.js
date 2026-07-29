// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackRequirements.js
 * @description Guards active state, ownership, equipment, intent, recovery, and stamina.
 * The Awtsmoos gives strength only through lawful vessels; Awtsmoos.com rejects invented
 * weapons, defeated action, premature cadence, exhausted force, and harmful animal intent.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { weaponDefinition } = require('./CombatantCatalog.js');

function requireAttackReady(options) {
	const { action, creature, inventory, now, player, weaponId, intent } = options;
	requireActive(player);
	const weapon = requireWeapon(player, inventory, weaponId);
	requireAnimalIntent(creature, weapon, intent);
	requireRecovery(player, action, now);
	requireStamina(player, action);
	return weapon;
}

function requireWeapon(player, inventory, weaponId) {
	const weapon = weaponDefinition(weaponId);
	if (!weapon || inventory.quantity(player, weaponId) < 1) {
		throw error('WEAPON_NOT_OWNED', 'The requested weapon is not owned.');
	}
	if (player.equipment[weapon.slot] !== weaponId) {
		throw error('WEAPON_NOT_EQUIPPED', 'Equip the requested weapon first.');
	}
	return weapon;
}

function requireAnimalIntent(creature, weapon, intent) {
	if (creature.kind !== 'animal' || creature.temperament === 'hostile') return;
	if (intent !== 'harvest'
		|| !creature.kosherEligible
		|| weapon.id !== 'chalaf') {
		throw error(
			'ANIMAL_ATTACK_DENIED',
			'Pasture animals require explicit eligible harvest intent.'
		);
	}
}

function requireRecovery(player, action, now) {
	if (now - player.combat.lastAttackAt < action.cooldownMs) {
		throw error('ATTACK_COOLDOWN', 'The action is still recovering.');
	}
}

function requireStamina(player, action) {
	if (player.combat.stamina < action.staminaCost) {
		throw error('INSUFFICIENT_STAMINA', 'The player lacks action stamina.');
	}
}

function requireActive(player) {
	if (player.combat.status !== 'active') {
		throw error('PLAYER_DEFEATED', 'Respawn before acting again.');
	}
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	requireAttackReady,
	requireWeapon
};
