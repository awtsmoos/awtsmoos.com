//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fighter dna vessel in this instant, revealing
 * its focused js fighters service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { rng, pick } from '../core/random.js';
import { SEFIRAH_NAMES, SEFIROT } from '../data/sefirot.js';
import { WEAPON_IDS } from '../data/weapons.js';
/** B"H — DNA: the hidden scroll from which bones and courage unfold. */
export function createDNA(seed) {
	const r = rng(seed);
	const sefirah = pick(r, SEFIRAH_NAMES);
	const s = SEFIROT[sefirah];
	return {
		seed,
		sefirah,
		height: r(0.88, 1.22),
		mass: r(0.85, 1.35),
		arm: r(0.86, 1.32),
		leg: r(0.88, 1.28),
		hue: r(25, 330),
		power: r(0.85, 1.2) * s.power,
		speed: r(0.85, 1.25) * s.speed,
		recovery: r(0.85, 1.2) * s.recovery,
		weaponPreference: pick(r, WEAPON_IDS)
	};
}
