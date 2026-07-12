/** B"H @module MarketScenes - temptation speaks with a human voice. */
import { beat as b, pair, scene } from '../builders/SceneBuilder.js';

export const MarketScenes = [
	...pair('market_price_blessing', [
		b('Merchant נ', 'נ', 'A blessing is only air until someone sets a price. Sell me the right to name yours.'),
		b('Ohr Chozer', 'א', 'I will examine the market before I answer.')
	], [
		b('Merchant נ', 'נ', 'You traded objects and refused to trade meaning. That distinction will cost you later.'),
		b('Market Watchman', 'ו', 'Counterfeit lights appeared while everyone watched the price board.')
	]),
	scene('market_price_choice', [
		b('Merchant נ', 'נ', 'The offer is open. Will you investigate it, or refuse without turning me into a monster?', { choices: [
			{ id: 'investigate', label: 'Investigate the offer', action: 'missionChoice', value: 'investigate_exchange' },
			{ id: 'refuse_now', label: 'Refuse without hatred', action: 'missionChoice', value: 'investigate_exchange' }
		] })
	]),
	...pair('market_counterfeit', [
		b('Market Watchman', 'ו', 'These scrolls glow brighter than the real ones. That is exactly why no one asks where the letters came from.'),
		b('Ohr Chozer', 'א', 'We will compare source, seal, and consequence—not brightness alone.')
	], [
		b('Market Watchman', 'ו', 'The false light shattered when named. The caravan can travel again.'),
		b('Caravan Keeper', 'ק', 'Travel with us. Scarcity has learned to ambush families before it attacks wagons.')
	]),
	...pair('market_caravan', [
		b('Caravan Keeper', 'ק', 'Two roads climb to Jerusalem. One is shorter. The other keeps the weakest travelers in sight.'),
		b('Ohr Chozer', 'א', 'We take the road that arrives together.')
	], [
		b('Caravan Keeper', 'ק', 'Not one traveler was reduced to cargo.'),
		b('Levi', 'ל', 'The Merchant has locked our Niggun in a warehouse and filed ownership over its silence.')
	]),
	...pair('market_song_owned', [
		b('Merchant נ', 'נ', 'Pay me for the song, and I will call the theft a transaction.'),
		b('Ohr Chozer', 'א', 'A song carried by a people cannot become your private silence.')
	], [
		b('Levi', 'ל', 'The warehouse doors opened when the song stopped asking permission.'),
		b('Narrator', '✦', 'Far beyond the market, the House of Forgetting lit one window and erased another name.')
	]),
	scene('market_song_choice', [
		b('Merchant נ', 'נ', 'Name the terms. What makes this song free?', { choices: [
			{ id: 'refuse_price', label: 'Refuse the price', action: 'missionChoice', value: 'refuse_price' },
			{ id: 'gift_truth', label: 'Return it as a gift', action: 'missionChoice', value: 'refuse_price' }
		] })
	])
];
