//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CivicCrises
 * @description
 * A city is tested where its values meet pressure. Awtsmoos.com turns those
 * tests into strategy, while the Awtsmoos gives each society responsibility
 * to protect sacred truth, life, family, property, creatures, and justice.
 */
export const CRISES = Object.freeze([
	crisis('01', 'Cult of Power', 'A powerful figure demands worship and absolute obedience.'),
	crisis('01', 'Golden Idol', 'Prosperity is being treated as the city’s highest power.'),
	crisis('02', 'Speech of Contempt', 'Public mockery is turning sacred speech into cruelty.'),
	crisis('02', 'Desecration Campaign', 'A movement spreads contempt for the Creator through deliberate abuse.'),
	crisis('03', 'Violent Raid', 'Armed attackers threaten innocent lives at the city edge.'),
	crisis('03', 'Hidden Assassins', 'A plot seeks to remove a witness by destroying a human life.'),
	crisis('04', 'Broken Households', 'Secret forbidden relationships are destabilizing families.'),
	crisis('04', 'Boundary Collapse', 'The city is losing the protected boundaries of family life.'),
	crisis('05', 'Market Theft', 'Merchants are taking property through fraud and false measures.'),
	crisis('05', 'Treasury Robbery', 'Public resources are being redirected into private hands.'),
	crisis('06', 'Cruel Butchery', 'Animals are being mutilated while alive for faster production.'),
	crisis('06', 'Living-Creature Abuse', 'The city’s appetite is becoming indifferent to animal suffering.'),
	crisis('07', 'Corrupt Judges', 'Bribes are replacing evidence in the courts.'),
	crisis('07', 'Lawless Power', 'Leaders claim they are beyond judgment and accountability.')
]);

/**
 * @param {string} foundation Mitzvah number tested.
 * @param {string} title Event title.
 * @param {string} text Event explanation.
 * @returns {Readonly<Object>} Crisis record.
 */
function crisis(foundation, title, text) {
	return Object.freeze({ foundation, title, text });
}
