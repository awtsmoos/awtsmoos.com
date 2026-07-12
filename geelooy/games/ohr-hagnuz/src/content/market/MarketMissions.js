/** B"H @module MarketMissions - economy, temptation, protection, and refusal. */
import { mission, objective as o } from '../builders/MissionBuilder.js';

export const MarketMissions = [
	mission('market_price_blessing', 'The Price of a Blessing', 'market', 13, 'Merchant נ', 'Market_Of_Exchange', 'market_counterfeit', [
		o('enter_market', 'TRAVEL', 'Market_Of_Exchange', 'Enter the Market of Exchange.'),
		o('merchant_offer', 'TALK', 'נ', 'Hear the offer that tries to price a blessing.'),
		o('investigate_exchange', 'CHOICE', 'investigate_exchange', 'Choose how to answer the bargain.', { sceneId: 'market_price_choice' }),
		o('buy_ink', 'SHOP_BUY', 'ink', 'Buy ordinary ink at a fair price.'),
		o('sell_fig', 'SHOP_SELL', 'fig', 'Sell one ordinary fig while protecting first fruits.')
	], { rewards: { exp: 80, zuzim: 32, sparks: 4 } }),
	mission('market_counterfeit', 'Counterfeit Light', 'market', 13, 'Market Watchman', 'Market_Of_Exchange', 'market_caravan', [
		o('inspect_scroll', 'INSPECT', 'scroll', 'Inspect the copied scroll for false letters.', { mapId: 'Market_Of_Exchange' }),
		o('inspect_chest', 'INSPECT', 'chest', 'Compare the sealed chest with its claimed source.', { mapId: 'Market_Of_Exchange' }),
		o('mimic_battle', 'BATTLE', 'mimic_light', 'Expose and defeat Counterfeit Light.', { auto: true }),
		o('report_counterfeit', 'TALK', 'נ', 'Confront the merchant with the evidence.')
	], { rewards: { exp: 95, zuzim: 38, items: { balm: 1 } } }),
	mission('market_caravan', 'The Seven-Species Caravan', 'market', 15, 'Caravan Keeper', 'Jerusalem_Ascent', 'market_song_owned', [
		o('ascent', 'TRAVEL', 'Jerusalem_Ascent', 'Join the caravan on the Jerusalem ascent.'),
		o('provisions', 'GATHER', 'orchard_fig_tree', 'Gather provisions without touching first fruits.', { count: 2 }),
		o('first_ambush', 'BATTLE', 'caravan_ambush', 'Protect the caravan through two attacks.', { auto: true, count: 2 }),
		o('deliver_caravan', 'DELIVER', 'jerusalem_caravan', 'Deliver the caravan and all vulnerable travelers.')
	], { rewards: { exp: 120, zuzim: 45, sparks: 7 } }),
	mission('market_song_owned', 'A Song Cannot Be Owned', 'market', 14, 'Levi', 'Market_Of_Exchange', 'house_blessings', [
		o('return_market', 'TRAVEL', 'Market_Of_Exchange', 'Return to the warehouse district.'),
		o('refuse_price', 'CHOICE', 'refuse_price', 'Choose how to return the stolen Niggun.', { sceneId: 'market_song_choice' }),
		o('merchant_boss', 'BATTLE', 'merchant_exchange_boss', 'Defeat the Merchant of Exchange.', { auto: true }),
		o('free_song', 'DELIVER', 'stolen_niggun', 'Return the Niggun to the Levi.')
	], { rewards: { exp: 150, zuzim: 60, sparks: 10 } })
];
