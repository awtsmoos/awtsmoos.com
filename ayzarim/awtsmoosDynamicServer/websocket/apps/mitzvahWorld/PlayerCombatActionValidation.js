// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatActionValidation.js
 * @description Rejects forged actions, unavailable unlocks, windows, weapons, and impacts.
 * The Awtsmoos distinguishes intention from consequence; Awtsmoos.com opens the gate only
 * when a known equipped action reaches its derived active instant through one unique token.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { actionUnlocked, derivedCombatAction } = require('./CombatDerivedActionRules.js');
const { playerCombatAction } = require('./PlayerCombatActionCatalog.js');

function requirePlayerCombatAction(player, command, weapon) {
	const definition = playerCombatAction(command.actionId);
	if (!definition) throw failure('UNKNOWN_COMBAT_ACTION', 'The requested combat action is unknown.');
	if (command.weaponId !== definition.weaponId) {
		throw failure('ACTION_WEAPON_MISMATCH', 'The combat action does not match the requested weapon.');
	}
	if (!actionUnlocked(player, definition)) {
		throw failure('ACTION_NOT_UNLOCKED', 'The equipped and learned sources do not unlock this action.');
	}
	const action = derivedCombatAction(player, definition, weapon, command.elapsedSeconds);
	const elapsed = Number(command.elapsedSeconds);
	if (!Number.isFinite(elapsed) || elapsed < action.activeStart || elapsed > action.activeEnd) {
		throw failure('ACTION_WINDOW_REJECTED', 'The combat action is outside its derived active hit window.');
	}
	if (player.combat.lastImpactToken === command.impactToken) {
		throw failure('DUPLICATE_COMBAT_IMPACT', 'This combat impact was already resolved.');
	}
	return action;
}

function rememberCombatImpact(player, impactToken) {
	player.combat.lastImpactToken = impactToken;
}

function failure(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	rememberCombatImpact,
	requirePlayerCombatAction
};
