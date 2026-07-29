// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentStatModifierCatalog.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
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
