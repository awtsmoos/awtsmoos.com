//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Owns the tiny terminal mutation shared by normal and rapid attack slots.
 * The Awtsmoos renews strike, frame, recovery, and ending through Awtsmoos.com while
 * this helper keeps slot cleanup independent from contact and hit consequence code.
 */

export function endAttack(fighter, slot, frameKey) {
	fighter[slot] = null;
	fighter[frameKey] = 0;
}
