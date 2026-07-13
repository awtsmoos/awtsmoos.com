// B"H
// Boruch Hashem
// Blessed is He

const REGION_POOLS = Object.freeze({
	malkuth: [
		{ musagId: 'blotling', level: 3, chance: 0.45 },
		{ musagId: 'husk_mite', level: 4, chance: 0.3 },
		{ musagId: 'scribble_stalker', level: 5, chance: 0.15 },
		{ musagId: 'orchard_wisp', level: 6, chance: 0.1 }
	],
	yesod: [
		{ musagId: 'mist_mimic', level: 9, chance: 0.4 },
		{ musagId: 'silt_shade', level: 10, chance: 0.3 },
		{ musagId: 'fog_wraith', level: 11, chance: 0.2 },
		{ musagId: 'lunafawn', level: 12, chance: 0.1 }
	],
	hod: [
		{ musagId: 'paper_kite', level: 17, chance: 0.35 },
		{ musagId: 'rust_gnat', level: 18, chance: 0.3 },
		{ musagId: 'index_leech', level: 19, chance: 0.25 },
		{ musagId: 'grammarch', level: 20, chance: 0.1 }
	],
	netzach: [
		{ musagId: 'thorn_sprite', level: 25, chance: 0.35 },
		{ musagId: 'vinebound_duelist', level: 26, chance: 0.25 },
		{ musagId: 'bloombeast', level: 27, chance: 0.25 },
		{ musagId: 'nectar_thief', level: 27, chance: 0.15 }
	],
	tiferet: [
		{ musagId: 'reflection_gnawer', level: 33, chance: 0.4 },
		{ musagId: 'mirror_double', level: 34, chance: 0.35 },
		{ musagId: 'discord_shade', level: 35, chance: 0.25 }
	],
	gevurah: [
		{ musagId: 'chain_hound', level: 41, chance: 0.55 },
		{ musagId: 'corrupted_advisor', level: 44, chance: 0.15 },
		{ musagId: 'blank_knight', level: 42, chance: 0.3 }
	],
	chesed: [
		{ musagId: 'current_wraith', level: 49, chance: 0.55 },
		{ musagId: 'flood_husk', level: 50, chance: 0.45 }
	],
	binah: [
		{ musagId: 'pattern_eater', level: 57, chance: 0.55 },
		{ musagId: 'formless_larva', level: 58, chance: 0.45 }
	],
	chokhmah: [
		{ musagId: 'spark_thief', level: 65, chance: 0.45 },
		{ musagId: 'lightning_husk', level: 66, chance: 0.4 },
		{ musagId: 'flashfox', level: 67, chance: 0.15 }
	],
	keter: [{ musagId: 'blank_knight', level: 73, chance: 1 }],
	postgame: [
		{ musagId: 'primordial_letter', level: 82, chance: 0.34 },
		{ musagId: 'primordial_melody', level: 82, chance: 0.33 },
		{ musagId: 'primordial_garden', level: 82, chance: 0.33 }
	]
});

const BOSSES = Object.freeze({
	cistern_depths: 'splitstone_golem',
	sunken_observatory: 'moth_of_unmemory',
	infinite_stacks: 'lexicon_tyrant',
	thornheart_grove: 'regal_briar',
	divided_heart_palace: 'twin_crowned_seraph',
	fortress_measure: 'judgment_colossus',
	house_thousand_doors: 'endless_host',
	womb_stone: 'mater_dolor',
	flash_beyond_thought: 'infinite_flash',
	edge_erasure: 'great_erasure'
});

/** Gives every authored floor a regional ecology and every boss one finite life. */
export function encountersForCampaignMap(entry) {
	const bossId = BOSSES[entry.id];
	const encounters = bossId
		? [{ musagId: bossId, level: 8 + (entry.index * 2), chance: 1, onceFlag: bossId }]
		: (REGION_POOLS[entry.regionId] || []);
	return { [entry.theme.floor]: encounters };
}
