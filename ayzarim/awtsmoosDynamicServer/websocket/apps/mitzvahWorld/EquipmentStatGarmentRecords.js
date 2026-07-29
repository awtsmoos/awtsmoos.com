// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GARMENT_EQUIPMENT_STATS.js
 * @description Generated readable equipment truth. Source SHA-256: 57a2945af016a93b1f3481b7c6c88a50944a7405bc6e3a5c931839da2d84d9ee.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const GARMENT_EQUIPMENT_STATS = deepFreeze({
	"scholar-glasses": {
		"actions": [],
		"modifiers": {
			"maxFocus": 3,
			"focusRegeneration": 0.3,
			"spiritualResistance": 0.024,
			"perfectTiming": 0.01
		}
	},
	"shabbos-top-hat": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxFocus": 2,
			"spiritualResistance": 0.016,
			"reputation": 0.04
		}
	},
	"black-coat": {
		"actions": [],
		"modifiers": {
			"maxHealth": 12,
			"guardStamina": 6,
			"physicalResistance": 0.06,
			"staggerResistance": 0.09,
			"environmentalResistance": 0.06
		}
	},
	"white-outer-shirt": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxFocus": 3,
			"focusRegeneration": 0.25,
			"physicalResistance": 0.02,
			"spiritualResistance": 0.024,
			"reputation": 0.03
		}
	},
	"base-shirt": {
		"actions": [],
		"modifiers": {
			"maxHealth": 2,
			"maxFocus": 1,
			"physicalResistance": 0.01,
			"spiritualResistance": 0.008
		}
	},
	"black-trousers": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxStamina": 4,
			"physicalResistance": 0.02,
			"movementSpeed": 0.01
		}
	},
	"walking-boots": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxStamina": 5,
			"movementSpeed": 0.05,
			"recoverySpeed": 0.04,
			"environmentalResistance": 0.03
		}
	}
});

function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.values(value).forEach(deepFreeze);
	return Object.freeze(value);
}

module.exports = { GARMENT_EQUIPMENT_STATS };
