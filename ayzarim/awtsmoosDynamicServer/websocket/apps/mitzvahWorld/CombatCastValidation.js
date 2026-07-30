// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatCastValidation.js
 * @description Validates authoritative support identity, loadout, equipment, timing, cost, cooldown, and replay.
 * The Awtsmoos renews compassionate intention without allowing a forged result to descend;
 * Awtsmoos.com checks every cast vessel before healing, cleansing, restraint, or interrupt can extend.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { requireCombatCooldownReady } = require('./CombatCooldownRules.js');
const { requireCombatImpactToken } = require('./PlayerCombatActionValidation.js');
const { playerSupportCast } = require('./PlayerSupportCastCatalog.js');

function requirePlayerSupportCast(player, command, now = Date.now()) {
	const action = playerSupportCast(command.actionId);
	if (!action) {
		throw failure('UNKNOWN_SUPPORT_CAST', 'The requested support cast is unknown.');
	}
	if (player.combat.status !== 'active') {
		throw failure('PLAYER_DEFEATED', 'Respawn before using support casts.');
	}
	requireSupportEquipment(player, action);
	requireSupportLoadout(player, action);
	requireCastTiming(command.elapsedMs, action.castMs);
	if (Number(player.combat.stamina || 0) < action.staminaCost) {
		throw failure('INSUFFICIENT_STAMINA', 'The player lacks stamina for that support cast.');
	}
	try {
		requireCombatCooldownReady(player.combat, action.id, now);
	} catch (error) {
		throw failure('COMBAT_CAST_COOLDOWN', 'That support cast has not recovered yet.');
	}
	requireCombatImpactToken(player, command.castInstanceId, now);
	return action;
}

function requireSupportEquipment(player, action) {
	if (action.id === 'returning-spark') return;
	if (player.equipment?.hand !== 'wooden-staff') {
		throw failure('SUPPORT_CAST_EQUIPMENT_REQUIRED', 'Equip the wooden staff for that support cast.');
	}
}

function requireSupportLoadout(player, action) {
	const loadout = player.shliach?.affinityLoadout;
	if (!loadout?.actionIds?.length) return;
	if (loadout.selectedAffinityId !== action.affinityId) {
		throw failure('SUPPORT_CAST_AFFINITY_MISMATCH', 'The selected affinity does not match that cast.');
	}
	if (!loadout.actionIds.includes(action.id)) {
		throw failure('SUPPORT_CAST_NOT_EQUIPPED', 'That support cast is not in the active loadout.');
	}
}

function requireCastTiming(elapsedMs, castMs) {
	const elapsed = Number(elapsedMs);
	const minimum = Math.max(0, Number(castMs || 0));
	if (!Number.isFinite(elapsed) || elapsed < minimum || elapsed > minimum + 750) {
		throw failure('SUPPORT_CAST_WINDOW_REJECTED', 'The support cast resolved outside its authoritative window.');
	}
}

function failure(code, message) {
	return new RealtimeError(code, message);
}

module.exports = { requirePlayerSupportCast };
