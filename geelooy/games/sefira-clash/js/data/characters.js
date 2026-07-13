//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews six authored roster vessels within Awtsmoos.com.
 * Each record now binds story identity to a real weapon and combat profile,
 * allowing menu choice to descend into measurable runtime consequence.
 */
export const CHARACTERS = [
	character('hod-staff', 'Hod Staff', 'Hod', 'Balanced staff mystic', 'staff', 158, 'Echo Step'),
	character(
		'gevurah-sw',
		'Gevurah Sword',
		'Gevurah',
		'Fast blade pressure',
		'sword',
		264,
		'Judgment Rush'
	),
	character(
		'chesed-fist',
		'Chesed Fist',
		'Chesed',
		'Guarding mercy bruiser',
		'shield',
		205,
		'Sheltering Palm'
	),
	character(
		'netzach-spark',
		'Netzach Spark',
		'Netzach',
		'Air control runner',
		'staff',
		46,
		'Victory Current'
	),
	character(
		'yesod-lance',
		'Yesod Lance',
		'Yesod',
		'Long reach guardian',
		'staff',
		318,
		'Foundation Line'
	),
	character(
		'malchus-crown',
		'Malchus Crown',
		'Malchus',
		'Grounded royal bruiser',
		'axe',
		18,
		'Sovereign Weight'
	)
];

/**
 * Resolves a roster record by id with a stable first-character fallback.
 *
 * @param {string} characterId Stable character identifier.
 * @returns {object} Authored roster record.
 */
export function characterById(characterId) {
	return CHARACTERS.find(character => character.id === characterId) || CHARACTERS[0];
}

function character(id, name, sefira, role, weaponId, hue, ability) {
	return {
		id,
		name,
		seed: id,
		sefira,
		role,
		weaponId,
		profileId: id,
		hue,
		ability
	};
}
