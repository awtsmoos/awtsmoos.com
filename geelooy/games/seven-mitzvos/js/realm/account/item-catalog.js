//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ItemCatalog
 * @description
 * Every tool carries material, weight, wear, skill law, and honest purpose. The
 * Awtsmoos creates the substance beneath all substance; Awtsmoos.com refuses the
 * hollow item that is only a number wearing a decorative name.
 */
export const ITEM_CATALOG = Object.freeze(Object.fromEntries([
	item('traveler-coat', 'Traveler coat', 'body', 'cloth-and-leather', 2.4, 120, 'cloth', { defense: 0.05, navigation: 0.04 }, {}, 'Weathered protection sewn for long roads.'),
	item('timber-hammer', 'Bridgewright hammer', 'tool', 'oak-and-iron', 3.1, 110, 'timber', { construction: 0.18, crafting: 0.1 }, { construction: 1 }, 'Balanced for joints, pegs, and repair work.'),
	item('rescue-rope', 'Braided rescue rope', 'back', 'hemp-and-leather', 2.8, 95, 'cloth', { rescue: 0.16, navigation: 0.08 }, { rescue: 1 }, 'Thirty cubits of inspected braided line.'),
	item('merchant-scale', 'Honest merchant scale', 'utility', 'brass-and-iron', 1.6, 90, 'iron', { trade: 0.16, investigation: 0.08 }, { trade: 1 }, 'Calibrated weights expose dishonest measures.'),
	item('medicine-satchel', 'Physician satchel', 'utility', 'leather-and-cloth', 1.9, 85, 'leather', { medicine: 0.18, animalCare: 0.1, rescue: 0.06 }, { medicine: 1 }, 'Compartments protect herbs, bandages, and glass.'),
	item('evidence-lens', 'Court evidence lens', 'tool', 'brass-and-glass', 0.7, 70, 'iron', { investigation: 0.22 }, { investigation: 2 }, 'Reveals fibers, scratches, seals, and altered ink.'),
	item('bridgewright-gloves', 'Bridgewright gloves', 'hands', 'leather-and-iron', 0.9, 100, 'leather', { construction: 0.16, crafting: 0.05 }, { construction: 2 }, 'Reinforced palms preserve grip on stone and timber.'),
	item('sanctuary-cloak', 'Sanctuary keeper cloak', 'body', 'wool-and-leather', 2.1, 105, 'cloth', { animalCare: 0.18, medicine: 0.08 }, { animalCare: 2 }, 'Quiet wool keeps frightened creatures calm.'),
	item('road-warden-staff', 'Road warden staff', 'mainHand', 'ash-and-iron', 2.9, 120, 'timber', { defense: 0.18, rescue: 0.05 }, { defense: 2 }, 'A nonlethal staff for distance, restraint, and rescue.')
].map(value => [value.id, value])));

export const EQUIPMENT_SLOTS = Object.freeze([
	'head', 'body', 'hands', 'feet', 'mainHand', 'offHand', 'tool', 'back', 'utility'
]);

export function itemDefinition(id) {
	return ITEM_CATALOG[id] || null;
}

function item(id, name, slot, material, weight, maxDurability, repairResource, effects, requirements, description) {
	return Object.freeze({ id, name, slot, material, weight, maxDurability, repairResource, effects: Object.freeze(effects), requirements: Object.freeze(requirements), description });
}
