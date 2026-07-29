// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ServerCombatDefenseService.js
 * @description Owns multiplayer guard intent, direction, stamina, break, parry, and resistance.
 * The Awtsmoos renews attacker and guardian without confusion; Awtsmoos.com measures
 * equipped vessel, finite opening, protected arc, spent guard, and bounded consequence.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');
const { serverDefenseAction } = require('./ServerCombatDefenseCatalog.js');

class ServerCombatDefenseService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	begin(player, actionId) {
		const action = serverDefenseAction(actionId);
		if (!action) throw error('UNKNOWN_DEFENSE_ACTION', 'The requested defense action is unknown.');
		if (player.combat.status !== 'active') throw error('PLAYER_DEFEATED', 'Respawn before guarding.');
		if (player.equipment.hand !== action.weaponId) throw error('DEFENSE_WEAPON_MISMATCH', 'Equip the required defensive weapon.');
		const now = this.clock();
		if (active(player.combat.guardBrokenUntil, now)) throw error('GUARD_BROKEN', 'Guard has not recovered yet.');
		if (player.combat.stamina < action.staminaCost) throw error('INSUFFICIENT_STAMINA', 'The player lacks defensive stamina.');
		player.combat.stamina -= action.staminaCost;
		player.combat.guardActionId = action.id;
		player.combat.guardFacing = player.facing;
		player.combat.guardUntil = now + action.durationMs;
		player.combat.parryUntil = now + action.parryMs;
		return this.snapshot(player, now);
	}

	resolve(player, creature, rawDamage, now = this.clock()) {
		this.normalizeGuard(player);
		const stats = derivedPlayerStats(player);
		const guarded = active(player.combat.guardUntil, now) && directionProtected(player, creature);
		const parried = guarded && active(player.combat.parryUntil, now);
		if (guarded) return this.resolveGuard(player, creature, rawDamage, stats, now, parried);
		const reduced = Math.max(0, rawDamage - stats.armor * 0.45);
		return receipt(reduced * (1 - stats.physicalResistance), 'physical-resistance');
	}

	resolveGuard(player, creature, rawDamage, stats, now, parried) {
		const guardCost = rawDamage * (parried ? 0.2 : 1);
		player.combat.guardStamina = Math.max(0, player.combat.guardStamina - guardCost);
		if (parried) {
			creature.staggeredUntil = now + 900;
			return receipt(0, 'parry', { parried: true });
		}
		if (player.combat.guardStamina <= 0) {
			player.combat.guardBrokenUntil = now + 900;
			player.combat.guardUntil = null;
			player.combat.parryUntil = null;
			return receipt(rawDamage, 'guard-break', { guardBroken: true });
		}
		return receipt(rawDamage * (1 - stats.blockStrength), 'physical-guard');
	}

	regenerate(player, amount = 4, now = this.clock()) {
		this.normalizeGuard(player);
		if (active(player.combat.guardUntil, now) || active(player.combat.guardBrokenUntil, now)) return;
		player.combat.guardStamina = Math.min(player.combat.maximumGuardStamina, player.combat.guardStamina + amount);
	}

	snapshot(player, now = this.clock()) {
		this.normalizeGuard(player);
		return {
			blocked: active(player.combat.guardUntil, now),
			broken: active(player.combat.guardBrokenUntil, now),
			guardActionId: player.combat.guardActionId,
			parry: active(player.combat.parryUntil, now),
			stamina: player.combat.guardStamina
		};
	}

	normalizeGuard(player) {
		const maximum = derivedPlayerStats(player).guardStamina;
		player.combat.maximumGuardStamina = maximum;
		player.combat.guardStamina = Math.min(maximum, Number(player.combat.guardStamina ?? maximum));
	}
}

function directionProtected(player, creature) {
	const angle = Math.atan2(creature.position.x - player.position.x, creature.position.z - player.position.z);
	return Math.abs(normalize(angle - player.combat.guardFacing)) <= Math.PI * 0.6;
}
function normalize(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}
function active(until, now) {
	return Number.isFinite(until) && now <= until;
}
function receipt(damage, source, extra = {}) {
	return { damage: Math.max(0, Math.round(damage)), mitigationSource: source, ...extra };
}
function error(code, message) {
	return new RealtimeError(code, message);
}
module.exports = { ServerCombatDefenseService };
