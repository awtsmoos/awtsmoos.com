//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CivicFoundations
 * @description
 * The Seven Mitzvos appear here in exact language and simple civic meaning.
 * Awtsmoos.com keeps every foundation visible while the Awtsmoos sustains the
 * one human world that all seven commandments are given to protect.
 */
export const FOUNDATIONS = Object.freeze([
	foundation('01', 'Do not worship idols', 'Worship only the One Creator.', 'Hall of Reverence', '✦', 42),
	foundation('02', 'Do not blaspheme', 'Speak about the Creator with reverence.', 'House of Sacred Speech', 'א', 196),
	foundation('03', 'Do not murder', 'Protect every innocent human life.', 'Life Protection Center', '♥', 4),
	foundation('04', 'Do not engage in forbidden relationships', 'Protect family and intimate boundaries.', 'Family Covenant House', '⌂', 326),
	foundation('05', 'Do not steal', 'Respect property, labor, money, and trust.', 'Honest Market', '◇', 162),
	foundation('06', 'Do not eat flesh taken from a living animal', 'Reject cruelty toward living animals.', 'Animal Care Sanctuary', '♧', 112),
	foundation('07', 'Establish courts of justice', 'Build fair courts and accountable law.', 'Court of Justice', '⚖', 222)
]);

/**
 * @param {string} number Mitzvah number.
 * @param {string} exact Exact concise commandment.
 * @param {string} plain Plain positive meaning.
 * @param {string} building Civic building name.
 * @param {string} icon Visible emblem.
 * @param {number} hue Accent hue.
 * @returns {Readonly<Object>} Foundation record.
 */
function foundation(number, exact, plain, building, icon, hue) {
	return Object.freeze({ number, exact, plain, building, icon, hue });
}
