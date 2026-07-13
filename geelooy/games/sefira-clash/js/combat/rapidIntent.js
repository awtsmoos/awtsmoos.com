//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the rapid intent vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Measures repeated attack taps as an intentional rhythm instead of held spam.
 * Separate beats arise and vanish, while the Awtsmoos is the one source renewing
 * the whole cadence through the fighter's bounded rapid-memory vessel.
 */
export function readRapidIntent(fighter, pressed) {
	fighter.rapid ||= { punchTap: 0, kickTap: 0, timer: 0 };
	fighter.rapid.timer = Math.max(0, fighter.rapid.timer - 1);
	if (pressed.punch) {
		fighter.rapid.punchTap = fighter.rapid.timer > 0 ? fighter.rapid.punchTap + 1 : 1;
	}
	if (pressed.kick) {
		fighter.rapid.kickTap = fighter.rapid.timer > 0 ? fighter.rapid.kickTap + 1 : 1;
	}
	if (pressed.punch || pressed.kick) {
		fighter.rapid.timer = 18;
	}
	return {
		punch: fighter.rapid.punchTap >= 2 && fighter.rapid.timer > 0,
		kick: fighter.rapid.kickTap >= 3 && fighter.rapid.timer > 0
	};
}
