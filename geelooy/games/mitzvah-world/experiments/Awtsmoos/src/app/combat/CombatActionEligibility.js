// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatActionEligibility.js
 * @description Validates cooldown, equipment, stamina, and combo ancestry before intent.
 * The Awtsmoos gives power its truthful vessel; Awtsmoos.com refuses an action whose
 * weapon, energy, succession, transition, or recovery boundary is not presently real.
 */
import { inventoryDefinition } from '../../gameplay/InventoryCatalog.js';

export function combatActionRejection(combat, action) {
	if (combat.cast || combat.melee) return 'ACTION_IN_PROGRESS';
	if (combat.runtime.playerDefeat?.isDefeated?.()) return 'PLAYER_DEFEATED';
	if (combat.runtime.transitioning || combat.runtime.regions?.transitioning) return 'TRANSITION_ACTIVE';
	if (combat.cooldownRemaining(action.id) > 0) return 'ACTION_COOLDOWN';
	if (!requiredEquipmentPresent(combat.runtime, action)) return 'REQUIRED_EQUIPMENT';
	if (!comboAvailable(combat, action)) return 'COMBO_PREDECESSOR_REQUIRED';
	if (currentStamina(combat.runtime) < action.staminaCost) return 'INSUFFICIENT_STAMINA';
	return null;
}

export function spendCombatActionCost(combat, action) {
	const stats = combat.runtime.playerStats;
	stats.stamina = Math.max(0, currentStamina(combat.runtime) - action.staminaCost);
	combat.runtime.bus.emit('profile:state', { ...stats });
}

export function regenerateCombatStamina(combat, deltaSeconds) {
	const stats = combat.runtime.playerStats;
	const maximum = Math.max(1, Number(stats.maxStamina) || 100);
	const rate = Math.max(0, Number(stats.staminaRegeneration) || 14);
	stats.stamina = Math.min(maximum, currentStamina(combat.runtime) + rate * deltaSeconds);
}

export function completeCombatAction(combat, action) {
	combat.lastCompletedAction = {
		expiresAt: combat.clock + Math.max(0.25, action.recovery + 0.55),
		id: action.id
	};
}

function currentStamina(runtime) {
	const maximum = Math.max(1, Number(runtime.playerStats.maxStamina) || 100);
	const value = Number(runtime.playerStats.stamina);
	return Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : maximum;
}

function comboAvailable(combat, action) {
	if (!action.comboPredecessor) return true;
	return combat.lastCompletedAction?.id === action.comboPredecessor
		&& combat.clock <= combat.lastCompletedAction.expiresAt;
}

function requiredEquipmentPresent(runtime, action) {
	if (!action.requiredSlot && !action.requiredWeaponClass) return true;
	const itemId = runtime.inventory?.snapshot?.().equipment?.[action.requiredSlot];
	const definition = inventoryDefinition(itemId);
	if (!definition) return false;
	if (!action.requiredWeaponClass) return true;
	return weaponClass(definition, itemId) === action.requiredWeaponClass;
}

function weaponClass(definition, itemId) {
	if (itemId === 'wooden-staff' || /staff/i.test(definition.modelId || '')) return 'staff';
	if (itemId === 'spark-blade' || /sword|blade/i.test(definition.modelId || '')) return 'sword';
	if (definition.category === 'shield') return 'shield';
	return definition.category || null;
}
