// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentUpgradeService.js
 * @description Consumes durable materials and grants one inspectable passive stat source.
 * The Awtsmoos transforms gathered vessels into lasting choice; Awtsmoos.com refuses missing
 * ownership, level, material, duplicate upgrade, or duplicate passive contribution.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { equipmentUpgrade } = require('./EquipmentUpgradeCatalog.js');
const { ensureExpansionState } = require('./PlayerExpansionState.js');

class EquipmentUpgradeService {
	upgrade(player, upgradeId) {
		const definition = equipmentUpgrade(upgradeId);
		if (!definition) {
			throw error('UNKNOWN_UPGRADE', 'The requested equipment upgrade is unknown.');
		}
		const state = ensureExpansionState(player);
		if (state.upgrades.includes(upgradeId)) {
			return { duplicate: true, upgradeId };
		}
		if (Number(player.progression?.level || 1) < definition.requiredLevel) {
			throw error('UPGRADE_LEVEL_REQUIRED', 'More progression is required for this upgrade.');
		}
		if (!owns(player, definition.itemId)) {
			throw error('UPGRADE_ITEM_NOT_OWNED', 'Own the equipment before upgrading it.');
		}
		requireMaterials(state, definition.materials);
		consumeMaterials(state, definition.materials);
		state.upgrades.push(upgradeId);
		player.passiveStatSources ||= [];
		const sourceId = `upgrade:${upgradeId}`;
		if (!player.passiveStatSources.some(source => source.id === sourceId)) {
			player.passiveStatSources.push({
				category: 'passive',
				id: sourceId,
				modifiers: definition.modifiers
			});
		}
		return { duplicate: false, sourceId, upgradeId };
	}
}

function owns(player, itemId) {
	return (player.inventory || []).some(stack => {
		return stack.itemId === itemId && stack.quantity > 0;
	});
}

function requireMaterials(state, materials) {
	for (const [materialId, quantity] of Object.entries(materials)) {
		if (Number(state.materials[materialId] || 0) < quantity) {
			throw error('UPGRADE_MATERIAL_REQUIRED', `Missing upgrade material: ${materialId}.`);
		}
	}
}

function consumeMaterials(state, materials) {
	for (const [materialId, quantity] of Object.entries(materials)) {
		state.materials[materialId] -= quantity;
	}
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	EquipmentUpgradeService
};
