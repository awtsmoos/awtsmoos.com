// B"H
// Boruch Hashem
// Blessed is He

/** @file SwordActionCatalog.js @description Visible sword combo, heavy, guard, and parry records. */
import { combatActionRecord as action } from './CombatActionRecord.js';

const shared = { icon: '⚔️', letters: 'חרב', requiredSlot: 'hand', requiredWeaponClass: 'sword', serverIntent: 'player-melee' };

export const SWORD_ACTIONS = Object.freeze(Object.fromEntries([
	slash('sword-light', 'Light Sword Slash', 'KeyF', 'F', 0.14, 0.27, 0.2, 3.6, 78, 1, 9, 'sword-follow'),
	slash('sword-follow', 'Follow-up Slash', 'KeyG', 'G', 0.13, 0.27, 0.22, 3.7, 88, 1.08, 10, 'sword-finish', 'sword-light'),
	slash('sword-finish', 'Finishing Slash', 'KeyR', 'R', 0.24, 0.41, 0.4, 4, 104, 1.45, 18, null, 'sword-follow', { knockback: 1.8, stagger: 2 }),
	slash('sword-heavy', 'Heavy Sword Attack', 'KeyV', 'V', 0.48, 0.69, 0.5, 4.2, 70, 1.8, 26, null, null, { knockback: 2.2, stagger: 3 }),
	defense('sword-block', 'Sword Block', 'KeyC', 'C', 'block', 0.06, 9, 0.18, 0),
	defense('sword-parry', 'Perfect Sword Block', 'KeyX', 'X', 'parry', 0, 0.16, 0.34, 7)
]));

function slash(id, displayName, keyCode, keyLabel, windup, activeEnd, recovery, range, arcDegrees, multiplier, staminaCost, comboSuccessor, comboPredecessor = null, extra = {}) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, arcDegrees, baseDamageMultiplier: multiplier, comboPredecessor, comboSuccessor, displayName, id, keyCode, keyLabel, label: displayName, range, recovery, staminaCost, verticalTolerance: 1.8, windup, ...extra })];
}
function defense(id, displayName, keyCode, keyLabel, type, windup, activeEnd, recovery, staminaCost) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, displayName, id, keyCode, keyLabel, label: displayName, recovery, staminaCost, type, windup })];
}
