// B"H
// Boruch Hashem
// Blessed is He

function title(id) {
	return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function item(id, type = 'quest_item', effect = null, sellValue = 8) {
	return [id, {
		id,
		name: title(id),
		desc: `${title(id)} carries a remembered relationship in the Scribe’s journey.`,
		type,
		effect,
		sellValue
	}];
}

const ingredients = [
	'scribe_reed', 'river_ink', 'clean_grain', 'moonwater_sample', 'ironberry',
	'sunleaf', 'red_sap', 'singing_pod', 'resonant_seed', 'moonblossom',
	'orchard_fruit', 'river_fish', 'loom_thread', 'understanding_blossom',
	'conceptual_fragment', 'elemental_core', 'conductive_crystal', 'unnamed_seed'
];

const questObjects = [
	'tamar_field_lens', 'first_page_fragment', 'memory_token', 'star_lens',
	'office_seal', 'office_delivery', 'escaped_archive_page', 'correct_identity_record',
	'classification_stone', 'original_city_charter', 'camp_emblem',
	'festival_instrument', 'stolen_song_page', 'tamar_reflected_memory',
	'contradictory_evidence', 'ration_crate', 'pale_ink_fragment',
	'flood_medicine', 'missing_inventory_record', 'learned_binah_map',
	'torn_map_piece', 'shattered_lightning_vessel', 'momentary_inscription',
	'keter_memory_token', 'chronicle_first_page', 'malkuth_melody_fragment',
	'regional_melody_fragment', 'both_faction_emblems', 'valuable_voluntary_gift'
];

const crafted = [
	['durable_ink', 'battle_tool'],
	['wilds_remedy', 'consumable', { type: 'heal_and_cleanse', amount: 45 }],
	['travel_meal', 'consumable', { type: 'heal', amount: 35 }],
	['reinforced_vessel', 'battle_tool'],
	['growth_limiter', 'battle_tool'],
	['memory_thread', 'consumable', { type: 'cure_status', status: 'blank' }],
	['echo_seal', 'recruitment'],
	['moonwater_offering', 'recruitment']
];

const regionOfferings = [
	'malkuth', 'yesod', 'hod', 'netzach', 'tiferet', 'gevurah',
	'chesed', 'binah', 'chokhmah', 'keter', 'postgame'
].map(region => `${region}_offering`);

const special = [
	['restorative_tea', 'consumable', { type: 'heal', amount: 40 }, 18],
	['echo_shard', 'material', null, 12]
];

export const campaignItems = Object.freeze(Object.fromEntries([
	...ingredients.map(id => item(id, 'ingredient')),
	...questObjects.map(id => item(id)),
	...crafted.map(values => item(...values)),
	...regionOfferings.map(id => item(id, 'recruitment')),
	...special.map(values => item(...values))
]));
