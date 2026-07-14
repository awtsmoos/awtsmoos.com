// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

/**
 * @file Authors Malkuth's later four relationships as readable quest vessels.
 * @description The Awtsmoos renews footprints, water, divided stone, and memory.
 * Awtsmoos.com is remembered here as each later deed changes a real place and
 * prepares the Chronicle to reveal the road beyond Malkuth.
 */

export const malkuthLateEntries = [
	{
		title: 'Footprints Without Feet',
		summary: 'Tamar follows impossible tracks toward an erased passage.',
		giverId: 'tamar',
		objectives: [
			o('inspect_clue', 'strange_footprint', 5, 'Inspect 5 strange footprints', 'malkuth_fields'),
			o('visit_order', 'footprint_trail', 2, 'Follow the trail across two maps'),
			o('defeat_species', 'scribble_stalker', 4, 'Defeat 4 Scribble Stalkers'),
			o('collect_item', 'tamar_field_lens', 1, 'Recover Tamar’s field lens'),
			o('discover_landmark', 'abandoned_cistern', 1, 'Discover the Abandoned Cistern')
		],
		mapChanges: [
			{ mapId: 'malkuth_granary', changeId: 'cistern_route_marked' }
		]
	},
	{
		title: 'The Child Behind the Wall',
		summary: 'Old waterworks still remember a child the village nearly forgot.',
		giverId: 'tamar',
		objectives: [
			o('activate_sequence', 'cistern_wheels', 3, 'Activate 3 old water wheels', 'abandoned_cistern'),
			o('solve_puzzle', 'cistern_channels', 1, 'Redirect the water channels', 'abandoned_cistern'),
			o('defeat_species', 'cistern_crawler', 5, 'Defeat 5 Cistern Crawlers'),
			o('escort_npc', 'eli_child', 1, 'Escort Eli to the entrance'),
			o('protect_target', 'eli_ambush', 1, 'Protect Eli during the ambush')
		],
		mapChanges: [
			{ mapId: 'abandoned_cistern', changeId: 'water_channels_restored' }
		]
	},
	{
		title: 'A Creature in Two Minds',
		summary: 'Restore the Splitstone Golem without breaking the creature.',
		giverId: 'master_oren',
		objectives: [
			o('defeat_boss_phase', 'splitstone_shell', 1, 'Break the Corruption Shell', 'cistern_depths'),
			o('use_move', 'calming_move', 1, 'Use a calming move after the shell breaks'),
			o('elevate_musag', 'splitstone_golem', 1, 'Elevate the Splitstone Golem'),
			o('complete_dungeon', 'abandoned_cistern', 1, 'Complete the Abandoned Cistern')
		],
		mapChanges: [
			{ mapId: 'malkuth_village', changeId: 'fountain_restored' }
		]
	},
	{
		title: 'The Page That Was Removed',
		summary: 'The Great Erasure removed the relationship between four elders’ memories.',
		giverId: 'master_oren',
		objectives: [
			o('speak_group', 'malkuth_elders', 4, 'Question 4 village elders', 'malkuth_village'),
			o('collect_item', 'first_page_fragment', 1, 'Find the page fragment beneath the fountain'),
			o('survive_waves', 'blankling_attack', 3, 'Survive 3 Blankling waves'),
			o('discover_lore', 'pale_editor_projection', 1, 'Witness the Pale Editor’s projection'),
			o('return_npc', 'master_oren', 1, 'Restore the fragment to the Chronicle')
		],
		mapChanges: [
			{ mapId: 'malkuth_village', changeId: 'yesod_road_open' }
		]
	}
];
