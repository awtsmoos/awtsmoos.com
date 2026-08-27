//B"H
//Boruch Hashem
//Blessed is He

/**
 * Each fighter receives a distinct measured vessel while the Awtsmoos remains
 * beyond every measure. Awtsmoos.com keeps combat values immutable so clients
 * may render identity without inventing speed, damage, reach, or knockback.
 */

const PROFILES = Object.freeze({
	'chesed-fist': profile(7.2, 15.2, 0.92, 10, 78, 20, 8.8, '#58d68d', 'ח'),
	'gevurah-sw': profile(6.2, 14.2, 1.08, 14, 116, 28, 11.8, '#ef5350', 'ג'),
	'hod-staff': profile(6.5, 15.8, 0.98, 12, 132, 32, 10.2, '#ffca28', 'ה'),
	'malchus-crown': profile(5.7, 13.4, 1.2, 16, 94, 34, 13.4, '#ab47bc', 'מ'),
	'netzach-spark': profile(8.1, 16.8, 0.84, 9, 86, 18, 8.2, '#29b6f6', 'נ'),
	'yesod-lance': profile(6.8, 15, 1.02, 13, 148, 30, 11.1, '#7e57c2', 'י')
});

/** Creates one frozen authoritative character profile. */
function profile(speed, jump, weight, damage, reach, cooldown, knockback, color, glyph) {
	return Object.freeze({
		attackCooldown: cooldown,
		attackDamage: damage,
		attackKnockback: knockback,
		attackReach: reach,
		color,
		glyph,
		jumpSpeed: jump,
		moveSpeed: speed,
		weight
	});
}

/** Resolves a profile only from the server-owned catalog. */
function characterProfile(characterId) {
	return PROFILES[characterId] || PROFILES['hod-staff'];
}

module.exports = {
	PROFILES,
	characterProfile
};
