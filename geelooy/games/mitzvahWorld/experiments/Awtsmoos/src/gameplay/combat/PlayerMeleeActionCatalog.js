// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeActionCatalog.js
 * @description Declares balanced staff and sword actions without per-animation conditionals.
 * The Awtsmoos binds Chesed and Gevurah in one readable scroll; Awtsmoos.com lets every
 * client and server inspect the same reach, arc, cost, combo, authority, and recovery whole.
 */

import { createPlayerMeleeAction as action } from './PlayerMeleeActionFactory.js';

const common = {
	requiredSlot: 'hand',
	verticalTolerance: 1.5,
	interruptible: true,
	targetLimit: 1,
	hitCount: 1
};

export const PLAYER_MELEE_ACTIONS = Object.freeze({
	'staff.light-one': action({ ...common, id: 'staff.light-one', displayName: 'Staff Strike', requiredWeaponClass: 'staff', animationId: 'staff.light-one', windUpSeconds: 0.18, activeStart: 0.18, activeEnd: 0.32, recoverySeconds: 0.28, movementAllowance: 0.45, rotationAllowance: 0.8, range: 3, arcDegrees: 78, baseDamageMultiplier: 0.9, stagger: 12, knockback: 0.4, staminaCost: 8, cooldownSeconds: 0.62, comboSuccessor: 'staff.light-two', serverIntent: 'melee-light' }),
	'staff.light-two': action({ ...common, id: 'staff.light-two', displayName: 'Returning Staff Strike', requiredWeaponClass: 'staff', animationId: 'staff.light-two', windUpSeconds: 0.14, activeStart: 0.14, activeEnd: 0.3, recoverySeconds: 0.3, movementAllowance: 0.5, rotationAllowance: 0.9, range: 3.15, arcDegrees: 86, baseDamageMultiplier: 1, stagger: 14, knockback: 0.5, staminaCost: 9, cooldownSeconds: 0.66, comboPredecessor: 'staff.light-one', comboSuccessor: 'staff.heavy-sweep', serverIntent: 'melee-light' }),
	'staff.heavy-sweep': action({ ...common, id: 'staff.heavy-sweep', displayName: 'Heavy Staff Sweep', requiredWeaponClass: 'staff', animationId: 'staff.heavy-sweep', windUpSeconds: 0.44, activeStart: 0.44, activeEnd: 0.72, recoverySeconds: 0.58, movementAllowance: 0.2, rotationAllowance: 0.65, range: 3.45, arcDegrees: 138, baseDamageMultiplier: 1.65, stagger: 32, knockback: 1.5, staminaCost: 22, cooldownSeconds: 1.45, comboPredecessor: 'staff.light-two', targetLimit: 3, serverIntent: 'melee-heavy' }),
	'staff.shove': action({ ...common, id: 'staff.shove', displayName: 'Staff Guard Break', requiredWeaponClass: 'staff', animationId: 'staff.shove', windUpSeconds: 0.22, activeStart: 0.22, activeEnd: 0.36, recoverySeconds: 0.4, movementAllowance: 0.25, rotationAllowance: 0.5, range: 2.45, arcDegrees: 52, baseDamageMultiplier: 0.45, stagger: 42, knockback: 2.1, staminaCost: 15, cooldownSeconds: 1.1, statusEffectId: 'guard-break', serverIntent: 'melee-guard-break' }),
	'sword.light-one': action({ ...common, id: 'sword.light-one', displayName: 'Sword Slash', requiredWeaponClass: 'sword', animationId: 'sword.light-one', windUpSeconds: 0.15, activeStart: 0.15, activeEnd: 0.27, recoverySeconds: 0.22, movementAllowance: 0.55, rotationAllowance: 0.95, range: 3.2, arcDegrees: 74, baseDamageMultiplier: 1, stagger: 10, knockback: 0.35, staminaCost: 7, cooldownSeconds: 0.5, comboSuccessor: 'sword.light-two', serverIntent: 'melee-light' }),
	'sword.light-two': action({ ...common, id: 'sword.light-two', displayName: 'Reverse Sword Slash', requiredWeaponClass: 'sword', animationId: 'sword.light-two', windUpSeconds: 0.13, activeStart: 0.13, activeEnd: 0.26, recoverySeconds: 0.24, movementAllowance: 0.58, rotationAllowance: 1, range: 3.25, arcDegrees: 82, baseDamageMultiplier: 1.05, stagger: 11, knockback: 0.4, staminaCost: 8, cooldownSeconds: 0.52, comboPredecessor: 'sword.light-one', comboSuccessor: 'sword.finisher', serverIntent: 'melee-light' }),
	'sword.finisher': action({ ...common, id: 'sword.finisher', displayName: 'Finishing Slash', requiredWeaponClass: 'sword', animationId: 'sword.finisher', windUpSeconds: 0.25, activeStart: 0.25, activeEnd: 0.42, recoverySeconds: 0.42, movementAllowance: 0.35, rotationAllowance: 0.72, range: 3.4, arcDegrees: 92, baseDamageMultiplier: 1.45, stagger: 22, knockback: 0.9, staminaCost: 16, cooldownSeconds: 0.95, comboPredecessor: 'sword.light-two', serverIntent: 'melee-finisher' }),
	'sword.heavy': action({ ...common, id: 'sword.heavy', displayName: 'Heavy Sword Cleave', requiredWeaponClass: 'sword', animationId: 'sword.heavy', windUpSeconds: 0.5, activeStart: 0.5, activeEnd: 0.7, recoverySeconds: 0.62, movementAllowance: 0.16, rotationAllowance: 0.55, range: 3.55, arcDegrees: 108, baseDamageMultiplier: 1.9, stagger: 35, knockback: 1.25, staminaCost: 24, cooldownSeconds: 1.55, targetLimit: 2, serverIntent: 'melee-heavy' })
});

export function playerMeleeAction(actionId) {
	return PLAYER_MELEE_ACTIONS[actionId] || null;
}
