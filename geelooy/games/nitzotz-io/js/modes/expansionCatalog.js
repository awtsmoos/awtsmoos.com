// B"H
// Boruch Hashem
// Blessed is He
import { defineMode } from './define.js';

/** Adventure and Hevruta extend the established arena without replacing one core path. */
export const EXPANSION_MODES = Object.freeze([
	defineMode(
		'adventure',
		'Shlichus Adventure',
		'Complete three seeded missions and settle earned perutot.',
		{
			untimed: true,
			win: 'shlichus',
			adventure: true,
			events: true,
			bosses: true,
			playerSpeed: 1.04,
			scoreScale: 1.12
		}
	),
	defineMode(
		'hevruta',
		'Hevruta Adventure',
		'Complete a Shlichus beside live same-origin room peers.',
		{
			untimed: true,
			win: 'shlichus',
			adventure: true,
			multiplayer: true,
			events: true,
			bosses: true,
			rivalSpeed: 1.08,
			scoreScale: 1.16
		}
	)
]);
