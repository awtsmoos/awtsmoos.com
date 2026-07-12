/** B"H @module GardenScenes - the law of gifts becomes lived relationship. */
import { beat as b, pair, scene } from '../builders/SceneBuilder.js';

export const GardenScenes = [
	...pair('garden_empty_basket', [
		b('Shepherd ש', 'ש', 'Every branch is heavy, yet every fruit tastes like dust. The orchard learned abundance and forgot gratitude.'),
		b('Shepherd ש', 'ש', 'Harvest carefully. The first fruit will try to call itself yours before you can thank its Source.')
	], [
		b('Shepherd ש', 'ש', 'Flavor returned when possession stopped being the first word.'),
		b('Kohen', 'כ', 'Bring what must rise first into the Hall of Separation.')
	]),
	...pair('garden_terumah', [
		b('Kohen', 'כ', 'Separation is not rejection. It is the art of giving each light the vessel that can receive it.'),
		b('Cold Calculation', '∑', 'Every receiver is a number. Every gift is a loss. Every law is empty.')
	], [
		b('Kohen', 'כ', 'You separated without severing. The Hall remembers compassion.'),
		b('Levi', 'ל', 'On the road ahead, a melody is missing the note that gives the rest their place.')
	]),
	...pair('garden_levi_song', [
		b('Levi', 'ל', 'I can play every note except the one no instrument owns.'),
		b('Ohr Chozer', 'א', 'Then we will listen between the notes until the road itself answers.')
	], [
		b('Levi', 'ל', 'The melody was never owned. It was waiting to be carried.'),
		b('Receiver Court', '⚖', 'The Collector has locked every first thing behind one word: mine.')
	]),
	scene('garden_levi_choice', [
		b('Levi', 'ל', 'The missing phrase cannot be forced. How will you invite it back?', { choices: [
			{ id: 'listen', label: 'Listen to the silence', action: 'missionChoice', value: 'restore_niggun' },
			{ id: 'hum', label: 'Hum the lost phrase', action: 'missionChoice', value: 'restore_niggun' }
		] })
	]),
	...pair('garden_collector', [
		b('Collector', '♛', 'First fruit, first coin, first praise—everything first belongs to the strongest hand.'),
		b('Ohr Chozer', 'א', 'The first belongs to the Source, and strength begins by remembering that.')
	], [
		b('Receiver Court', '⚖', 'Every gift reached its address. The road to Jerusalem is open.'),
		b('Merchant’s Voice', 'נ', 'And every address, surely, can be purchased.')
	])
];
