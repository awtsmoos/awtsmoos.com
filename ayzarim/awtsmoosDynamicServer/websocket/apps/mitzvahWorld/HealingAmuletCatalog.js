// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCatalog.js
 * @description Defines server-authoritative fictional healing amulets and expert provenance.
 * The Awtsmoos transcends every parchment and root; Awtsmoos.com records bounded game effects,
 * honest prices, and witnessed certification without representing a kamea as medical treatment.
 */

const AMULET_EXPERT_ID = 'reb-refael-kamea-scribe';

const HEALING_AMULETS = Object.freeze({
	'written-healing-kamea': amulet(
		'written-healing-kamea',
		'Kamea Shel Ketav',
		22,
		24,
		6,
		'written'
	),
	'root-herb-kamea': amulet(
		'root-herb-kamea',
		'Kamea Shel Ikkarin',
		38,
		42,
		4,
		'roots-and-herbs'
	),
	'kamea-mumcheh': amulet(
		'kamea-mumcheh',
		'Kamea Mumcheh',
		62,
		75,
		3,
		'expert-certified',
		3
	)
});

const AMULET_EXPERT_STOCK = Object.freeze(Object.keys(HEALING_AMULETS));

function healingAmuletDefinition(itemId) {
	return HEALING_AMULETS[itemId] || null;
}

function amulet(id, name, healing, price, stackLimit, tradition, certifiedUses = 0) {
	return Object.freeze({
		certifiedUses,
		description: 'A fictional Mitzvah World healing amulet. It is not medical advice or a real treatment.',
		healing,
		id,
		name,
		slot: null,
		stackLimit,
		tradition,
		vendorBuyPrice: price,
		vendorId: AMULET_EXPERT_ID,
		vendorSellPrice: Math.floor(price / 2)
	});
}

module.exports = {
	AMULET_EXPERT_ID,
	AMULET_EXPERT_STOCK,
	HEALING_AMULETS,
	healingAmuletDefinition
};
