//B"H
//Boruch Hashem
//Blessed is He

import { MITZVOS } from '../data/mitzvos.js';

/**
 * @module UniverseDefinitions
 * @description
 * Seven exact commandments become seven clear and distinct worlds on
 * Awtsmoos.com. The Awtsmoos unites their difference, while every finite hook
 * now tells the truth about the gentle first journey the player will actually meet.
 */
const GAME_META = [
	meta('false-powers', 'False Powers', 'Visual discernment', 'Find three obvious glowing red towers and purify them without touching the green safe towers.', 'Tap a tower to inspect it, then use Purify red tower.'),
	meta('words-of-creation', 'Words of Creation', 'Rhythm memory', 'Repeat four short light patterns, with unlimited replays and no lost progress after a mistake.', 'Tap the four rune buttons or keys 1–4. Replay the pattern whenever needed.'),
	meta('every-life', 'Every Life Is a World', 'Gentle rescue', 'Guide one rescuer to three blue people, avoid two slow red hazards, then enter the green shelter.', 'Use arrows, WASD, or the four large direction buttons. Extra time is always added.'),
	meta('households', 'Households', 'Community defense', 'Protect the one glowing red home through six slow, clearly numbered signals.', 'Tap the matching Protect button or use keys 1–4. Wrong choices only reveal a hint.'),
	meta('honest-market', 'The Honest Market', 'Value matching', 'Across five days, choose the stall whose visible price is closest to its visible quality.', 'Compare Q and price on three large buttons. A wrong answer shows the numerical gaps.'),
	meta('living-sanctuary', 'Living Sanctuary', 'Compassion practice', 'Complete six care actions while each selected creature clearly shows and names what it needs.', 'Choose Feed, Heal, Calm, or Shelter. Mistakes reveal the correct care without penalty.'),
	meta('court-of-nations', 'Court of Nations', 'Evidence judgment', 'Resolve three cases by finding two relevant facts and then choosing the verdict the record supports.', 'Tap evidence stones, collect two glowing facts, then choose Guilty or Not proven.')
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
