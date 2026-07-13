//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the weapon factory vessel in this instant, revealing
 * its focused js weapons service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { WEAPONS, WEAPON_IDS } from '../data/weapons.js';
/** B"H — weapon pickups descend as generated symbols, not external art. */
export function createWeapon(id, x, y) {
	const base = WEAPONS[id] || WEAPONS.sword;
	return { ...base, x, y, vx: 0, vy: 0, held: false, spin: 0 };
}
/**
 * Reveals the create map weapons behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 */
export function createMapWeapons(map) {
	return map.weaponSpawns.map((p, i) =>
		createWeapon(WEAPON_IDS[i % WEAPON_IDS.length], p.x, p.y)
	);
}
