// B"H
// Boruch Hashem
// Blessed is He

/** @file StaffActionCatalog.js @description Visible staff strikes, guard, parry, and casting records. */
import { combatActionRecord as action } from './CombatActionRecord.js';

const shared = { icon: '🪄', letters: 'מטה', requiredSlot: 'hand', requiredWeaponClass: 'staff', serverIntent: 'player-melee' };

export const STAFF_ACTIONS = Object.freeze(Object.fromEntries([
	staff('staff-light', 'Light Staff Strike', 'KeyF', 'F', 0.18, 0.31, 0.24, 3.8, 72, 0.85, 10, 'staff-follow'),
	staff('staff-follow', 'Follow-up Staff Strike', 'KeyG', 'G', 0.16, 0.3, 0.25, 4, 82, 0.95, 11, 'staff-heavy', 'staff-light'),
	staff('staff-heavy', 'Heavy Staff Sweep', 'KeyR', 'R', 0.42, 0.66, 0.48, 4.5, 145, 1.55, 24, null, 'staff-follow', { knockback: 2.6, stagger: 2 }),
	staff('staff-shove', 'Staff Guard Break', 'KeyV', 'V', 0.25, 0.39, 0.34, 3.2, 58, 0.55, 18, null, null, { knockback: 3.4, stagger: 3, statusEffect: 'guard-break' }),
	defense('staff-block', 'Staff Block', 'KeyC', 'C', 'block', 0.08, 9, 0.2, 0),
	defense('staff-parry', 'Perfect Staff Block', 'KeyX', 'X', 'parry', 0, 0.18, 0.38, 8)
]));

function staff(id, displayName, keyCode, keyLabel, windup, activeEnd, recovery, range, arcDegrees, multiplier, staminaCost, comboSuccessor, comboPredecessor = null, extra = {}) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, arcDegrees, baseDamageMultiplier: multiplier, comboPredecessor, comboSuccessor, displayName, id, keyCode, keyLabel, label: displayName, range, recovery, staminaCost, verticalTolerance: 2.1, windup, ...extra })];
}
function defense(id, displayName, keyCode, keyLabel, type, windup, activeEnd, recovery, staminaCost) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, displayName, id, keyCode, keyLabel, label: displayName, recovery, staminaCost, type, windup })];
}
