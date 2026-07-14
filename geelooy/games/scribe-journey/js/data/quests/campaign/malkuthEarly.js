// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

/**
 * @file Authors Malkuth's first four relationships as readable quest vessels.
 * @description The Awtsmoos renews name, ink, friendship, and remembered grain.
 * Awtsmoos.com is remembered here as each early deed has a visible place,
 * truthful objective, and reward that prepares the next lived relationship.
 */

const communityReputation = Object.freeze([
	{ factionId: 'malkuth_community', amount: 50 }
]);

export const malkuthEarlyEntries = [
	{
		title: 'A Name in Fresh Ink',
		summary: 'Master Oren awakens the blank Chronicle and entrusts the first Musag.',
		giverId: 'master_oren',
		objectives: [
			o('speak_npc', 'master_oren', 1, 'Speak to Master Oren', 'scribe_atheneum_main'),
			o('inspect_object', 'blank_chronicle', 1, 'Inspect the blank Chronicle', 'scribe_atheneum_main'),
			o('dialogue_choice', 'player_name_chosen', 1, 'Choose the Scribe’s name'),
			o('recruit_musag', 'starter_musag', 1, 'Choose Alephling, Golemet, or Neginah'),
			o('party_composition', 'starter_equipped', 1, 'Place the starter in the first party slot')
		]
	},
	{
		title: 'Reeds Before Sunrise',
		summary: 'Gather the materials that let the Chronicle hold living ink.',
		giverId: 'master_oren',
		objectives: [
			o('reach_map', 'malkuth_fields', 1, 'Travel to the Reedbank', 'malkuth_fields'),
			o('gather_node', 'scribe_reed', 5, 'Gather 5 Scribe Reeds', 'malkuth_fields'),
			o('collect_item', 'river_ink', 3, 'Collect 3 drops of River Ink', 'malkuth_fields'),
			o('resolve_encounter', 'blotling', 3, 'Defeat or calm 3 Blotlings', 'malkuth_fields'),
			o('return_npc', 'master_oren', 1, 'Return to Master Oren')
		],
		rewards: {
			playerXp: 200,
			money: 35,
			reputation: communityReputation,
			items: [{ itemId: 'kli_clay', quantity: 1 }]
		}
	},
	{
		title: 'The First Echo',
		summary: 'A frightened Orchard Wisp teaches that friendship requires attention.',
		giverId: 'tamar',
		objectives: [
			o('follow_trail', 'silver_letters', 3, 'Inspect 3 silver echo marks', 'malkuth_orchard'),
			o('battle_condition', 'orchard_wisp_below_35', 1, 'Lower the Orchard Wisp below 35% health'),
			o('recruit_musag', 'orchard_wisp', 1, 'Befriend the Orchard Wisp'),
			o('party_composition', 'orchard_wisp_active', 1, 'Return with Orchard Wisp active'),
			o('return_npc', 'tamar', 1, 'Report to Tamar')
		]
	},
	{
		title: 'Grain That Forgot the Field',
		summary: 'Yael’s granary is losing the memory of harvest.',
		giverId: 'yael_miller',
		objectives: [
			o('inspect_object', 'damaged_grain_sack', 4, 'Inspect 4 damaged grain sacks', 'malkuth_granary'),
			o('defeat_species', 'husk_mite', 6, 'Defeat 6 Husk Mites', 'malkuth_granary'),
			o('collect_item', 'clean_grain', 8, 'Recover 8 Clean Grain', 'malkuth_granary'),
			o('activate_object', 'husks_cleansed', 3, 'Cleanse 3 corrupted husks', 'malkuth_granary'),
			o('return_npc', 'yael_miller', 1, 'Return to Yael')
		],
		mapChanges: [
			{ mapId: 'malkuth_granary', changeId: 'food_station_open' }
		]
	}
];
