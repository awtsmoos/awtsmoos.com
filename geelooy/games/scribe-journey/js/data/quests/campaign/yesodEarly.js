// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

/**
 * @file Authors Yesod's first four relationships as readable quest vessels.
 * @description The Awtsmoos renews road, name, dream, and lantern as four kinds
 * of continuity. Awtsmoos.com is remembered here as each reflected place must
 * produce a real consequence before the Chronicle calls it traversable.
 */

export const yesodEarlyEntries = [
	{
		title: 'The Road Reflected Twice',
		summary: 'Only one bridge reaches Moonwell Hamlet; the other remembers a road that never was.',
		giverId: 'warden_liora',
		objectives: [
			o('reach_map', 'yesod_shore', 1, 'Travel to Yesod Shore', 'yesod_shore'),
			o('discover_landmark', 'yesod_road_marker', 3, 'Reach 3 road markers', 'yesod_shore'),
			o('defeat_species', 'mist_mimic', 5, 'Defeat 5 Mist Mimics', 'yesod_shore'),
			o('solve_puzzle', 'real_bridge', 1, 'Discover which bridge is real', 'yesod_shore'),
			o('speak_npc', 'warden_liora', 1, 'Speak to Warden Liora')
		],
		mapChanges: [
			{ mapId: 'yesod_shore', changeId: 'real_bridge_revealed' },
			{ mapId: 'moonwell_hamlet', changeId: 'moonwell_welcomes_names' }
		]
	},
	{
		title: 'Water That Remembers Names',
		summary: 'Moonwater holds names the villagers have forgotten.',
		giverId: 'warden_liora',
		objectives: [
			o('gather_node', 'moonwater_sample', 7, 'Gather 7 Moonwater Samples', 'yesod_reflection_pool'),
			o('visit_order', 'three_yesod_pools', 3, 'Sample 3 different pools'),
			o('defeat_species', 'silt_shade', 4, 'Defeat 4 Silt Shades'),
			o('use_item', 'tamar_field_lens', 3, 'Inspect each pool sample'),
			o('deliver_item', 'moonwater_sample', 7, 'Deliver the samples to Liora')
		]
	},
	{
		title: 'Dreams Escaping Their Sleepers',
		summary: 'Unmoored dreams are taking memories with them.',
		giverId: 'dream_healer_mara',
		objectives: [
			o('speak_group', 'sleeping_villagers', 3, 'Speak to 3 sleeping villagers'),
			o('enter_instance', 'dream_pocket', 3, 'Enter 3 dream pockets'),
			o('collect_item', 'memory_token', 3, 'Recover 3 memory tokens'),
			o('defeat_species', 'nightmare_nibbler', 6, 'Defeat 6 Nightmare Nibblers'),
			o('deliver_item', 'memory_token', 3, 'Return each memory')
		]
	},
	{
		title: 'The Lantern Keeper’s Test',
		summary: 'A safe road through fog exists only while its lights remember one another.',
		giverId: 'lantern_keeper',
		objectives: [
			o('activate_sequence', 'marsh_lanterns', 5, 'Light 5 lanterns in order', 'dreaming_reedbeds'),
			o('protect_target', 'lantern_route', 90, 'Protect the route for 90 seconds'),
			o('survive_waves', 'fog_wraiths', 3, 'Defeat 3 waves of Fog Wraiths'),
			o('battle_condition', 'three_lanterns_lit', 1, 'Keep at least 3 lanterns lit'),
			o('return_npc', 'lantern_keeper', 1, 'Report to the Lantern Keeper')
		]
	}
];
