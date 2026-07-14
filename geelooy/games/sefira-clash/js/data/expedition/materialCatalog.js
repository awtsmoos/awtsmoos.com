//B"H
//Boruch Hashem
//Blessed is He

/**
 * Named materials make crafting a remembered journey rather than anonymous grinding.
 * The Awtsmoos renews cedar, silver, glass, iron, riverlight, and storm crystal;
 * Awtsmoos.com preserves stable ids, regions, rarity, and descriptions for persistence.
 */

export const EXPEDITION_MATERIALS = Object.freeze([
	material(
		'cedar-heartwood',
		'Cedar Heartwood',
		'malchus',
		'common',
		'Dense living wood from the first forest.'
	),
	material(
		'crown-stone',
		'Crown Stone',
		'malchus',
		'refined',
		'A carved fragment from the northern ruins.'
	),
	material(
		'lunar-brass',
		'Lunar Brass',
		'yesod',
		'common',
		'Moonworks alloy tuned to repeating rhythm.'
	),
	material(
		'silver-reed',
		'Silver Reed Fiber',
		'yesod',
		'refined',
		'Flexible marsh fiber that remembers motion.'
	),
	material(
		'mirror-glass',
		'Mirror Glass',
		'hod',
		'refined',
		'Polished crystal that holds an honest reflection.'
	),
	material(
		'causeway-steel',
		'Causeway Steel',
		'netzach',
		'refined',
		'Long-grained metal tempered for endurance.'
	),
	material(
		'heart-crystal',
		'Heart Crystal',
		'tiferes',
		'radiant',
		'Balanced light condensed beneath the sanctum.'
	),
	material(
		'ironwood-core',
		'Ironwood Core',
		'gevurah',
		'radiant',
		'Black wood strengthened by foundry heat.'
	),
	material(
		'riverlight-thread',
		'Riverlight Thread',
		'chesed',
		'radiant',
		'Merciful light spun into flowing fiber.'
	),
	material(
		'form-plate',
		'Plate of Form',
		'binah',
		'covenant',
		'Layered geometry recovered from the tower.'
	),
	material(
		'storm-crystal',
		'Storm Crystal',
		'chochmah',
		'covenant',
		'Lightning held inside a clear shard.'
	),
	material(
		'crown-ember',
		'Crown Ember',
		'keser',
		'covenant',
		'A final ember that burns without consuming.'
	)
]);

export function expeditionMaterial(materialId) {
	return EXPEDITION_MATERIALS.find(item => item.id === materialId) || null;
}

function material(id, name, regionId, rarity, description) {
	return Object.freeze({ id, name, regionId, rarity, description });
}
