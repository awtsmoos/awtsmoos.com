/** B"H @module VillageMissions - the village becomes a living home. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const VillageMissions = [
	mission('village_floorboards', 'Sparks Beneath the Floorboards', 'village', 13, 'Elder E', 'Overworld_Main', 'village_sefer', [
		o('elder_request', 'TALK', 'E', 'Hear why the elder refuses to light her room.'),
		o('reed_oil', 'GATHER', 'parchment_reed', 'Gather three reeds for clean lamp wicks.', { count: 3 }),
		o('craft_wick', 'CRAFT', 'clean_wick', 'Craft a clean wick from the gathered reeds.'),
		o('restore_lamp', 'HEAL', 'synagogue', 'Carry the flame through the synagogue.'),
		o('floor_doubt', 'BATTLE', 'distraction_page', 'Defeat the distraction beneath the floor.', { auto: true }),
		o('elder_return', 'TALK', 'E', 'Return and choose who receives the first flame.')
	]),
	mission('village_sefer', 'The Sefer That Would Not Open', 'village', 12, 'Sage ס', 'Overworld_Main', 'village_minyan', [
		o('sage_request', 'TALK', 'ס', 'Ask the Sage why the clasps refuse every key.'),
		o('mishnah_page', 'INSPECT', 'mishnahSeeds', 'Read the page of precise order.'),
		o('tanya_page', 'INSPECT', 'TanyaFlame', 'Read the page of inward warmth.'),
		o('page_battle', 'BATTLE', 'distraction_page', 'Sweeten the distraction inside the page.', { auto: true }),
		o('sage_return', 'TALK', 'ס', 'Bring the opened sefer back to the Sage.')
	], { rewards: { exp: 55, zuzim: 14, items: { scroll: 1 } } }),
	mission('village_minyan', 'Minyan Before Midnight', 'village', 15, 'Guide ג', 'Overworld_Main', 'village_market_day', [
		o('guide_count', 'TALK', 'ג', 'Learn which voices are still missing.'),
		o('invite_child', 'TALK', 'C', 'Invite the child without dismissing the fear.'),
		o('invite_elder', 'TALK', 'E', 'Invite the elder after restoring her lamp.'),
		o('shared_mitzvah', 'MITZVAH', 'mitzvah', 'Perform the mitzvah that binds the group.'),
		o('communal_boss', 'BATTLE', 'noise_without_song', 'Turn communal noise into song.', { auto: true })
	], { rewards: { exp: 70, zuzim: 20, sparks: 5 } }),
	mission('village_market_day', 'The First Honest Trade', 'village', 10, 'Merchant נ', 'Overworld_Main', 'garden_empty_basket', [
		o('meet_merchant', 'TALK', 'נ', 'Ask the merchant what may and may not be priced.'),
		o('buy_tea', 'SHOP_BUY', 'tea', 'Buy tea for the road.'),
		o('sell_scroll', 'SHOP_SELL', 'scroll', 'Sell one ordinary scroll without selling a gift.'),
		o('report_trade', 'TALK', 'ג', 'Report what honest exchange felt like.')
	], { rewards: { exp: 40, zuzim: 25, sparks: 3 } })
];
