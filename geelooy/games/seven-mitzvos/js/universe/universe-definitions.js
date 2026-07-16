//B"H
//Boruch Hashem
//Blessed is He

import { MITZVOS } from '../data/mitzvos.js';

/**
 * @module UniverseDefinitions
 * @description
 * Seven exact commandments become seven mechanically distinct worlds on
 * Awtsmoos.com. The Awtsmoos unites their difference, allowing each game to
 * reveal one responsibility without severing it from the complete covenant.
 */
const GAME_META = [
	meta('false-powers', 'False Powers', 'Deduction', 'Scan hidden districts and purify proven corruption.', 'Tap or click districts. Use S to scan and P to purify.'),
	meta('words-of-creation', 'Words of Creation', 'Rhythm memory', 'Repeat growing sacred-letter patterns before your hearts expire.', 'Tap four pads or use keys 1–4 and A, S, D, F.'),
	meta('every-life', 'Every Life Is a World', 'Rescue tactics', 'Guide a rescuer through hazards, gather civilians, and reach shelter.', 'Use arrows, WASD, adjacent tiles, or the on-screen direction pad.'),
	meta('households', 'Households', 'Network strategy', 'Protect trust, boundaries, and support through ten community events.', 'Choose one intervention each turn with touch, click, or keys 1–3.'),
	meta('honest-market', 'The Honest Market', 'Economic detective', 'Trade across twelve days while exposing fraud and preserving trust.', 'Inspect, buy, sell, and advance the market day.'),
	meta('living-sanctuary', 'Living Sanctuary', 'Care management', 'Feed, heal, calm, and shelter rescued animals through ten days.', 'Select an animal, choose care actions, then advance the day.'),
	meta('court-of-nations', 'Court of Nations', 'Evidence strategy', 'Investigate evidence and deliver fair judgments across five cases.', 'Inspect evidence, choose a verdict and rationale, then submit.')
];

export const UNIVERSE_GAMES = Object.freeze(MITZVOS.map((mitzvah, index) => {
	return Object.freeze({ ...mitzvah, ...GAME_META[index], gameIndex: index });
}));

export const UNIVERSE_BY_ID = Object.freeze(Object.fromEntries(
	UNIVERSE_GAMES.map(record => [record.id, record])
));

function meta(id, gameTitle, genre, hook, controls) {
	return { id, gameTitle, genre, hook, controls };
}
