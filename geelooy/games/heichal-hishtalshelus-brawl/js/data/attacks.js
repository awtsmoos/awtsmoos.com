/**
 * B"H
 * Data-only combat scroll.
 *
 * Chapter 5: every strike receives a soul-shape. A jab is not a kick, a sweep
 * is not an uppercut, and a meteor is not a polite suggestion. These values
 * are readable, fast, and interpreted by the existing combat vessels.
 */
export const ATTACKS = {
  jab1: move('jab1', 'rightHand', 2, 4, 5, 5, 5.8, 52, -0.12, 'כ'),
  jab2: move('jab2', 'rightHand', 2, 4, 6, 6, 6.6, 54, -0.08, 'כ'),
  jab3: move('jab3', 'rightHand', 3, 5, 9, 9, 9.8, 58, -0.35, 'ך'),
  dashPunch: move('dashPunch', 'rightHand', 4, 6, 13, 12, 13.5, 68, -0.2, 'ד'),
  chargePunch: move('chargePunch', 'rightHand', 8, 7, 17, 15, 15.8, 74, -0.18, 'ץ'),
  uppercut: move('uppercut', 'rightHand', 5, 7, 15, 12, 14.2, 64, -1.18, 'ל'),
  roundhouse: move('roundhouse', 'rightFoot', 6, 8, 15, 13, 13.4, 70, -0.42, 'ר'),
  sweep: move('sweep', 'rightFoot', 5, 8, 12, 10, 9.6, 72, 0.12, 'נ'),
  aerialKick: move('aerialKick', 'rightFoot', 4, 8, 13, 11, 12.2, 66, -0.62, 'ה'),
  meteorKick: move('meteorKick', 'rightFoot', 7, 6, 18, 14, 16.5, 62, 1.32, 'ם'),
  grab: move('grab', 'rightHand', 4, 7, 12, 4, 13, 48, -0.55, 'ל'),
  special: move('special', 'weaponTip', 7, 12, 18, 10, 12, 66, -0.5, 'א')
};

/**
 * Declares a complete attack record.
 * @returns {object} Immutable-ish plain data consumed by startAttack.
 */
function move(id, limb, startup, active, recovery, damage, knock, radius, angle, letter) {
  return { id, limb, startup, active, recovery, damage, knock, radius, angle, letter };
}
