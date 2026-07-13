//B"H
//Boruch Hashem
//Blessed is He

/**
 * Character combat profiles reveal distinct vessels within Awtsmoos.com.
 * The Awtsmoos renews speed, weight, reach, guard, and power together so a
 * roster choice changes play instead of merely changing a label or hue.
 */
export const CHARACTER_PROFILES = {
	'hod-staff': profile('staff', 1, 1, 1.08, 1, 1.06),
	'gevurah-sw': profile('sword', 1.14, 0.92, 1.04, 1.1, 0.9),
	'chesed-fist': profile('shield', 0.86, 1.22, 0.9, 1.18, 1.24),
	'netzach-spark': profile('staff', 1.22, 0.82, 1.12, 0.9, 0.86),
	'yesod-lance': profile('staff', 0.96, 1.04, 1.2, 1.04, 1.08),
	'malchus-crown': profile('axe', 0.8, 1.3, 0.94, 1.24, 1.3)
};

/**
 * Resolves one stable profile while preserving a safe balanced fallback.
 *
 * @param {string} profileId Stable roster profile identifier.
 * @returns {object} Immutable-style combat multiplier record.
 */
export function characterProfile(profileId) {
	return CHARACTER_PROFILES[profileId] || CHARACTER_PROFILES['hod-staff'];
}

function profile(weaponId, speed, mass, jump, power, guard) {
	return {
		weaponId,
		speed,
		mass,
		jump,
		power,
		guard
	};
}
