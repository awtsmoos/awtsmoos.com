// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerDerivedStatSources.js
 * @description Converts authoritative equipment and explicit extra sources into one ledger.
 * The Awtsmoos renews owned and equipped as different truths; Awtsmoos.com counts only
 * current slots while learned, passive, and temporary gifts retain separate identities.
 */

const { equipmentStatRecord } = require('./EquipmentStatModifierCatalog.js');

function playerDerivedStatSources(player) {
	return [
		...equipmentSources(player),
		...normalized(player.learnedStatSources, 'learned'),
		...normalized(player.passiveStatSources, 'passive'),
		...normalized(player.temporaryStatSources, 'temporary')
	];
}

function equipmentSources(player) {
	return Object.entries(player.equipment || {}).flatMap(([slot, itemId]) => {
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

function normalized(sources, category) {
	return (Array.isArray(sources) ? sources : []).map((source, index) => ({
		actions: source.actions || [],
		category,
		id: source.id || `${category}-${index}`,
		modifiers: source.modifiers || {}
	}));
}

module.exports = {
	playerDerivedStatSources
};
