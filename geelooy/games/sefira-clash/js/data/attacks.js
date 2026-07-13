//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attacks vessel in this instant, revealing
 * its focused js data service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Data-only combat scroll, sharpened for real hands and feet.
 *
 * Punches are now fast chained sparks. Kicks now occupy space, reach farther,
 * and launch with commitment. Adventure needs readable verbs: jab, uppercut,
 * sweep, roundhouse, aerial kick, meteor stomp. The data stays plain so the
 * combat vessels can remain fierce and small.
 */
export const ATTACKS = {
	jab1: move('jab1', 'rightHand', 1, 4, 4, 5, 5.4, 58, -0.1, 'כ'),
	jab2: move('jab2', 'rightHand', 1, 4, 5, 6, 6.2, 60, -0.06, 'כ'),
	jab3: move('jab3', 'rightHand', 2, 5, 8, 10, 10.6, 64, -0.32, 'ך'),
	dashPunch: move('dashPunch', 'rightHand', 3, 6, 10, 12, 12.8, 76, -0.18, 'ד'),
	chargePunch: move('chargePunch', 'rightHand', 6, 7, 14, 17, 16.2, 84, -0.16, 'ץ'),
	uppercut: move('uppercut', 'rightHand', 4, 7, 11, 15, 14.8, 72, -1.2, 'ל'),
	roundhouse: move('roundhouse', 'rightFoot', 5, 9, 15, 16, 15.4, 88, -0.38, 'ר'),
	sweep: move('sweep', 'rightFoot', 4, 9, 12, 11, 10.4, 92, 0.16, 'נ'),
	aerialKick: move('aerialKick', 'rightFoot', 3, 8, 12, 14, 13.6, 82, -0.58, 'ה'),
	meteorKick: move('meteorKick', 'rightFoot', 6, 7, 15, 19, 17.8, 78, 1.34, 'ם'),
	grab: move('grab', 'rightHand', 4, 7, 12, 4, 13, 48, -0.55, 'ל'),
	special: move('special', 'weaponTip', 7, 12, 18, 10, 12, 66, -0.5, 'א')
};

/** @returns {object} Immutable-ish attack data consumed by startAttack. */
function move(id, limb, startup, active, recovery, damage, knock, radius, angle, letter) {
	return { id, limb, startup, active, recovery, damage, knock, radius, angle, letter };
}
