//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentAppearance.js
 * @description Applies garment choices without creating fabric pixels; only genuine authored or real remote maps may reveal clothing.
 * The Awtsmoos clothes the traveler beyond loom and canvas while Awtsmoos.com keeps every finite thread true;
 * color may describe hidden metadata, but sight waits for a real cloth or leather image before the garment comes through.
 */

import { garmentColor, garmentFabric } from '../gameplay/GarmentAppearanceCatalog.js';
import { inventoryAppearanceFor } from '../gameplay/InventoryAppearanceRules.js';
import { inventoryDefinition } from '../gameplay/InventoryCatalog.js';
import { isRealMaterialImage, materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../assets/RemoteMaterialReadiness.js';

/** Applies selected appearance while preserving only real authored imagery and preparing remote candidates. */
export function applyMinimalGarmentAppearance(wardrobe, equipment, appearance) {
	const receipt = {};
	for (const itemId of Object.values(equipment || {})) {
		const definition = inventoryDefinition(itemId);
		const visualId = definition?.garment?.visualId;
		if (!visualId || !definition.appearance) {
			continue;
		}
		const selected = inventoryAppearanceFor(appearance, itemId);
		const records = appearanceRecords(wardrobe, visualId);
		let materialCount = 0;
		for (const record of records) {
			for (const material of record.materials) {
				applyMaterial(material, selected);
				materialCount += 1;
			}
			enforceRecordReadiness(record);
		}
		receipt[visualId] = { itemId, ...selected, materials: materialCount };
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
	if (!selected || material.name === 'glasses-glass') {
		return;
	}
	const color = garmentColor(selected.colorId);
	const fabric = garmentFabric(selected.fabricId);
	const authored = material.userData?.originalMapImage;
	material.color = [...color.rgba];
	material.baseColorFactor = [...color.rgba];
	material.roughnessFactor = fabric.roughness;
	material.mapImage = isRealMaterialImage(authored)
		? authored
		: isRealMaterialImage(material.mapImage) ? material.mapImage : null;
	material.texturePolicy = {
		...(material.texturePolicy || {}),
		realMapImage: materialHasRealMap(material),
		remoteOnly: true,
		semanticRole: garmentRole(material, selected)
	};
	material.userData ||= {};
	Object.assign(material.userData, {
		garmentColorId: selected.colorId,
		garmentFabricId: selected.fabricId,
		remoteOnly: true
	});
	prepareRemoteMaterialForHydration({ name: material.name }, material);
}

function garmentRole(material, selected) {
	const text = `${material?.name || ''} ${selected?.fabricId || ''}`;
	return /shoe|boot|belt|leather/i.test(text) ? 'craft.leather' : 'fabric.cloth';
}

function enforceRecordReadiness(record) {
	for (const mesh of record?.meshes || []) {
		const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material].filter(Boolean);
		if (materials.length && !materials.every(materialHasRealMap)) {
			mesh.visible = false;
			mesh.userData ||= {};
			mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
		}
	}
}
