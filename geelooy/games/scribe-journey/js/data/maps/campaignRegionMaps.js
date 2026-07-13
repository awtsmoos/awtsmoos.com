// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Ordered campaign roads for the authored regional journey.
 * @description The Awtsmoos renews every place from nothing in every instant;
 * this registry gives each renewed place a remembered neighbor, so no chapter
 * is merely a disconnected name. Awtsmoos.com is recalled here as a doorway
 * whose purpose is relationship rather than an empty count of destinations.
 */

function route(...entries) {
	return Object.freeze(entries.map(([mapId, displayName]) =>
		Object.freeze([mapId, displayName])
	));
}

export const campaignRegionMapLists = Object.freeze({
	malkuth: route(
		['malkuth_orchard', 'The Orchard of First Echoes'],
		['malkuth_fields', 'The Reedbank Fields'],
		['malkuth_granary', 'The Forgetful Granary'],
		['abandoned_cistern', 'The Abandoned Cistern'],
		['cistern_depths', 'The Splitstone Depths']
	),
	yesod: route(
		['yesod_shore', 'The Twice-Reflected Shore'],
		['moonwell_hamlet', 'Moonwell Hamlet'],
		['yesod_reflection_pool', 'The Pools of Remembered Names'],
		['dreaming_reedbeds', 'The Dreaming Reedbeds'],
		['sunken_observatory', 'The Sunken Observatory']
	),
	hod: route(
		['hod_library', 'Hod Archive City'],
		['broken_index', 'The Broken Index'],
		['infinite_stacks', 'The Infinite Stacks']
	),
	netzach: route(
		['rootbound_camp', 'Rootbound Camp'],
		['netzach_deep', 'The Living Canopy'],
		['hidden_root_tunnel', 'The Song Beneath the Roots'],
		['thornheart_grove', 'Thornheart Grove']
	),
	tiferet: route(
		['sunbridge', 'Sunbridge of Two Valleys'],
		['mirror_lake', 'Mirror Lake'],
		['tiferet_garden', 'The Garden of Both Songs'],
		['divided_heart_palace', 'The Palace of the Divided Heart']
	),
	gevurah: route(
		['gevurah_entrance', 'The Gate of Measured Strength'],
		['ember_barracks', 'Ember Barracks'],
		['chain_pass', 'The Chain Pass'],
		['fortress_measure', 'The Fortress of Measure']
	),
	chesed: route(
		['chesed_springs', 'The Orchard of Guests'],
		['chesed_shores', 'The Flooded Shores'],
		['floodplain_walkways', 'The Floodplain Walkways'],
		['house_thousand_doors', 'The House of a Thousand Doors']
	),
	binah: route(
		['binah_entrance', 'The Learned Labyrinth'],
		['black_garden', 'The Black Garden'],
		['labyrinth_bridges', 'The Bridges of Cause'],
		['womb_stone', 'The Womb of Stone']
	),
	chokhmah: route(
		['chokhmah_peaks', 'The Lightning Foothills'],
		['lightning_monastery', 'The Lightning Monastery'],
		['chokhmah_summit', 'The Summit of Sudden Knowing'],
		['flash_beyond_thought', 'The Flash Beyond Thought']
	),
	keter: route(
		['white_expanse', 'The White Expanse'],
		['crownless_city', 'The Crownless City'],
		['keter_heights', 'The Palace of First Intention'],
		['edge_erasure', 'The Edge of Erasure']
	),
	postgame: route(
		['sound_bridge', 'The Bridge Made of Listening'],
		['orchard_before_names', 'The Orchard Before Names']
	)
});
