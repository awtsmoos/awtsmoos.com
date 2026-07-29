// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file COMBAT_EQUIPMENT_STATS.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const COMBAT_EQUIPMENT_STATS = deepFreeze({
	"chalaf": {
		"actions": [
			"chalaf-harvest"
		],
		"modifiers": {
			"activeWindow": 0.01,
			"perfectTiming": 0.01
		}
	},
	"wooden-staff": {
		"actions": [
			"staff-light",
			"staff-follow",
			"staff-heavy",
			"staff-shove",
			"staff-block",
			"staff-parry",
			"staff-cast"
		],
		"modifiers": {
			"baseDamage": 18,
			"attackSpeed": 0.05,
			"reach": 0.35,
			"activeWindow": 0.02,
			"stagger": 4,
			"knockback": 0.2,
			"staminaCost": -1,
			"blockStrength": 0.08,
			"guardStamina": 10,
			"castingStrength": 4,
			"cooldownReduction": 0.03,
			"perfectTiming": 0.02,
			"masteryGain": 0.1,
			"focusEfficiency": 0.04
		}
	},
	"spark-blade": {
		"actions": [
			"sword-light",
			"sword-follow",
			"sword-finish",
			"sword-heavy",
			"sword-block",
			"sword-parry"
		],
		"modifiers": {
			"baseDamage": 26,
			"attackSpeed": 0.12,
			"reach": 0.15,
			"activeWindow": 0.01,
			"stagger": 6,
			"knockback": 0.3,
			"blockStrength": 0.05,
			"guardStamina": 6,
			"cooldownReduction": 0.05,
			"perfectTiming": 0.03,
			"masteryGain": 0.12,
			"criticalChance": 0.04
		}
	},
	"village-shield": {
		"actions": [
			"shield-block",
			"shield-parry"
		],
		"modifiers": {
			"blockStrength": 0.25,
			"guardStamina": 30,
			"movementSpeed": -0.03,
			"staggerResistance": 0.12,
			"rangedResistance": 0.12,
			"areaResistance": 0.08
		}
	}
});

function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.values(value).forEach(deepFreeze);
	return Object.freeze(value);
}

module.exports = { COMBAT_EQUIPMENT_STATS };
