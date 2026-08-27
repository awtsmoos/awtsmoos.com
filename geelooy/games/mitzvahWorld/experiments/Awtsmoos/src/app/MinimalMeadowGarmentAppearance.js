// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentAppearance.js
 * @description Applies equipped item color and fabric choices to isolated garment materials.
 * The Awtsmoos clothes every finite hue without touching the shared source asset;
 * Awtsmoos.com preserves lenses and sacred leather while both jacket forms share appearance.
 */

import { garmentColor, garmentFabric } from '../gameplay/GarmentAppearanceCatalog.js';
import { inventoryAppearanceFor } from '../gameplay/InventoryAppearanceRules.js';
import { inventoryDefinition } from '../gameplay/InventoryCatalog.js';
import { garmentFabricTexture } from './MinimalMeadowGarmentFabricTexture.js';

export function applyMinimalGarmentAppearance(wardrobe, equipment, appearance) {
	const receipt = {};
	for (const itemId of Object.values(equipment || {})) {
		const definition = inventoryDefinition(itemId);
		const visualId = definition?.garment?.visualId;
		if (!visualId || !definition.appearance) continue;
		const selected = inventoryAppearanceFor(appearance, itemId);
		const records = appearanceRecords(wardrobe, visualId);
		let materialCount = 0;
		for (const record of records) {
			for (const material of record.materials) {
				applyMaterial(material, selected);
				materialCount += 1;
			}
		}
		receipt[visualId] = {
			itemId,
			...selected,
			materials: materialCount
		};
	}
	return receipt;
}

function appearanceRecords(wardrobe, visualId) {
	const ids = visualId === 'jacket'
		? ['jacket', 'jacket-tefillin']
		: [visualId];
	return ids.map(id => wardrobe?.visuals?.get(id)).filter(Boolean);
}

function applyMaterial(material, selected) {
	if (!selected || material.name === 'glasses-glass') return;
	const color = garmentColor(selected.colorId);
	const fabric = garmentFabric(selected.fabricId);
	const image = garmentFabricTexture(selected.fabricId);
	material.color = [...color.rgba];
	material.baseColorFactor = [...color.rgba];
	material.roughnessFactor = fabric.roughness;
	material.mapImage = image || material.userData?.originalMapImage || null;
	material.textureUrl = null;
	material.userData ||= {};
	Object.assign(material.userData, {
		garmentColorId: selected.colorId,
		garmentFabricId: selected.fabricId
	});
}
