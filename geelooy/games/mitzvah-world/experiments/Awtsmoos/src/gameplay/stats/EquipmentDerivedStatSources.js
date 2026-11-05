// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentDerivedStatSources.js
 * @description Converts only equipped slots into canonical generated modifier sources.
 * The Awtsmoos is one beyond counting; Awtsmoos.com counts each wielded or worn vessel
 * once, excludes merely owned inventory, and preserves the exact slot that grants its light.
 */

import { equipmentStatRecord } from './EquipmentStatModifierCatalog.js';

export function equipmentDerivedStatSources(snapshot = {}) {
	return Object.entries(snapshot.equipment || {}).flatMap(([slot, itemId]) => {
		const record = equipmentStatRecord(itemId);
		if (!record) return [];
		return [{
			actions: record.actions,
			category: 'equipped',
			id: `${slot}:${itemId}`,
			itemId,
			modifiers: record.modifiers,
			slot
		}];
	});
}
