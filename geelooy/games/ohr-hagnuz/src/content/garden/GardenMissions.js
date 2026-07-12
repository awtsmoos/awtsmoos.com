/** B"H @module GardenMissions - every gift is physically found before it is entrusted. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const GardenMissions = [
	mission('garden_empty_basket', 'The Orchard Keeper’s Empty Basket', 'garden', 14, 'Shepherd ש', 'Rambam_Garden', 'garden_terumah', [
		o('enter_garden', 'TRAVEL', 'Rambam_Garden', 'Enter the Garden of Ungiven Things.'),
		o('meet_shepherd', 'TALK', 'ש', 'Hear why the orchard stopped yielding flavor.'),
		o('gather_figs', 'GATHER', 'orchard_fig_tree', 'Gather six figs from three careful harvests.', { count: 3 }),
		o('orchard_battle', 'BATTLE', 'entitlement', 'Defeat the Entitlement of the Orchard.', { auto: true }),
		o('return_basket', 'TALK', 'ש', 'Return the basket without claiming the first fruit.')
	], { rewards: { exp: 75, zuzim: 22, items: { fig: 3 } } }),
	mission('garden_terumah', 'Terumah: What Must Rise First', 'garden', 14, 'Kohen', 'Hall_Of_Separation', 'garden_levi_song', [
		o('collect_terumah', 'INSPECT', 'terumah', 'Separate Terumah from the harvest.', { mapId: 'Rambam_Garden' }),
		o('enter_hall', 'TRAVEL', 'Hall_Of_Separation', 'Carry it into the Hall of Separation.'),
		o('mirror_order', 'PUZZLE', 'separation_mirrors', 'Align the mirrors without mixing their channels.', { mapId: 'Hall_Of_Separation' }),
		o('cold_law', 'BATTLE', 'cold_calculation', 'Defeat law severed from compassion.', { auto: true }),
		o('give_kohen', 'DELIVER', 'terumah', 'Deliver Terumah to its rightful receiver.')
	], { rewards: { exp: 85, zuzim: 24, sparks: 5 } }),
	mission('garden_levi_song', 'The Levi’s Broken Melody', 'garden', 13, 'Levi', 'Levi_Road', 'garden_collector', [
		o('return_for_tithe', 'TRAVEL', 'Rambam_Garden', 'Return to the Garden for the Levi’s portion.'),
		o('collect_levi_gift', 'INSPECT', 'maaser_rishon', 'Collect Maaser Rishon for the Levi.', { mapId: 'Rambam_Garden' }),
		o('enter_road', 'TRAVEL', 'Levi_Road', 'Walk the Road of Levi Songs.'),
		o('restore_niggun', 'CHOICE', 'restore_niggun', 'Choose the missing phrase of the Niggun.', { sceneId: 'garden_levi_choice' }),
		o('melody_battle', 'BATTLE', 'noise_fragment', 'Sweeten the Broken Melody.', { auto: true }),
		o('give_levi', 'DELIVER', 'maaser_rishon', 'Give the first tithe to the Levi.')
	], { rewards: { exp: 90, zuzim: 26, sparks: 5 } }),
	mission('garden_collector', 'The Collector of First Things', 'garden', 14, 'Receiver Court', 'Rambam_RecipientCourt', 'market_price_blessing', [
		o('return_for_gifts', 'TRAVEL', 'Rambam_Garden', 'Return for the remaining entrusted gifts.'),
		o('collect_poor_gift', 'INSPECT', 'maaser_ani', 'Collect Maaser Ani for those in need.', { mapId: 'Rambam_Garden' }),
		o('collect_second_gift', 'INSPECT', 'maaser_sheni', 'Collect Maaser Sheni for Jerusalem.', { mapId: 'Rambam_Garden' }),
		o('collect_first_fruits', 'INSPECT', 'bikkurim', 'Collect Bikkurim with gratitude.', { mapId: 'Rambam_Garden' }),
		o('enter_court', 'TRAVEL', 'Rambam_RecipientCourt', 'Enter the Court of Rightful Receivers.'),
		o('poor_gift', 'DELIVER', 'maaser_ani', 'Place the poor tithe before those who need it.'),
		o('collector_boss', 'BATTLE', 'collector_first_things', 'Defeat the Collector of First Things.', { auto: true }),
		o('second_gift', 'DELIVER', 'maaser_sheni', 'Resolve the second tithe for Jerusalem.'),
		o('first_fruits', 'DELIVER', 'bikkurim', 'Carry first fruits with gratitude.')
	], { rewards: { exp: 120, zuzim: 35, sparks: 8 } })
];
