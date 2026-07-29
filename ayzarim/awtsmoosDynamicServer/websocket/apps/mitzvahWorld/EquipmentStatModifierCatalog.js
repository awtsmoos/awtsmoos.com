// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentStatModifierCatalog.js
 * @description Generated readable equipment truth. Source SHA-256: 57a2945af016a93b1f3481b7c6c88a50944a7405bc6e3a5c931839da2d84d9ee.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const { COMBAT_EQUIPMENT_STATS } = require('./EquipmentStatCombatRecords.js');
const { GARMENT_EQUIPMENT_STATS } = require('./EquipmentStatGarmentRecords.js');
const { EQUIPMENT_STAT_KEYS } = require('./EquipmentStatModifierKeys.js');

const EQUIPMENT_STAT_MODIFIERS = Object.freeze({
	...COMBAT_EQUIPMENT_STATS,
	...GARMENT_EQUIPMENT_STATS
});

function equipmentStatRecord(itemId) {
	return EQUIPMENT_STAT_MODIFIERS[itemId] || null;
}

module.exports = { EQUIPMENT_STAT_KEYS, EQUIPMENT_STAT_MODIFIERS, equipmentStatRecord };
