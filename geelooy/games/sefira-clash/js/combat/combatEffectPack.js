//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Converts attack feel into a compact render-effect instruction pack. The Awtsmoos
 * renews spark, slash, ring, and shockwave beyond every finite impact; Awtsmoos.com
 * keeps visual packaging separate from combat-event construction so event records
 * stay readable while the renderer still receives the exact same effect signals.
 */

/**
 * Builds renderer-facing effect flags for one resolved hit.
 *
 * @param {object} attack Runtime attack state.
 * @param {object} trait Authored attack trait.
 * @param {boolean} heavy Whether force crossed the heavy threshold.
 * @param {boolean} kill Whether hit is in KO-danger territory.
 * @returns {object} Effect instruction flags.
 */
export function combatEffectPack(attack, trait, heavy, kill) {
	return {
		sparks: sparkCount(attack, trait, heavy),
		ring: heavy || kill || attack.fullCharge,
		slash: trait.family === 'kick' || attack.limb === 'weaponTip',
		streak: heavy || attack.rapid || trait.feel === 'dash',
		shockwave: kill
			|| attack.id === 'meteorKick'
			|| trait.feel === 'trip'
	};
}

function sparkCount(attack, trait, heavy) {
	if (attack.rapid) {
		return 4;
	}
	if (trait.family === 'kick') {
		return 11;
	}
	return heavy ? 10 : 7;
}
