// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelGarmentDetails.js
 * @description Renders real appearance and ten spiritual attributes for one Bag item.
 * The Awtsmoos is beyond all measures; Awtsmoos.com lets Chochmah, Binah, Daas, Chesed,
 * Gevurah, Tiferes, Netzach, Hod, Yesod, and Malchus remain visible gameplay facts.
 */

import { GARMENT_COLORS, GARMENT_FABRICS } from '../gameplay/GarmentAppearanceCatalog.js';
import { SPIRITUAL_STAT_KEYS, spiritualStatLabel } from '../gameplay/SpiritualStats.js';
import { inventoryItemAppearance } from './InventoryPanelState.js';

export function inventoryGarmentDetails(item, state) {
	const stats = SPIRITUAL_STAT_KEYS
		.filter(key => item.spiritual[key] !== 0)
		.map(key => `<span><b>${spiritualStatLabel(key)}</b> ${item.spiritual[key]}</span>`)
		.join('');
	const appearance = inventoryItemAppearance(state, item);
	const appearanceText = appearance
		? `<p><b>Appearance:</b> ${labelColor(appearance.colorId)} · ${labelFabric(appearance.fabricId)}</p>`
		: '';
	const requirement = item.required
		? '<p><b>Required base garment:</b> visible and not removable.</p>'
		: '';
	return `${appearanceText}${requirement}<div class="inv-spiritual-stats">${stats || '<span>No spiritual modifiers</span>'}</div>`;
}

function labelColor(id) {
	return GARMENT_COLORS[id]?.label || id;
}

function labelFabric(id) {
	return GARMENT_FABRICS[id]?.label || id;
}
