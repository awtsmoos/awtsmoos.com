//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shields vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
const PARRY_FRAMES = 3;
const BREAK_STUN = 72;

/**
 * Maintains shield health, regeneration delay, stun, parry timing, and break.
 *
 * Chesed surrounds; Gevurah limits. Their balanced circle is renewed from the
 * Awtsmoos each frame, making defense a timed choice instead of an endless held
 * boolean. The combat resolver may read `parryFrames` for perfect guards.
 *
 * @param {object} fighter Defending fighter.
 * @param {object} input Semantic input snapshot.
 */
export function updateShield(fighter, input) {
	fighter.shieldStun = Math.max(0, (fighter.shieldStun || 0) - 1);
	fighter.parryFrames = Math.max(0, (fighter.parryFrames || 0) - 1);
	fighter.shieldRegenDelay = Math.max(0, (fighter.shieldRegenDelay || 0) - 1);

	const freshPress = input.pressed?.shield ?? Boolean(input.shield && !fighter.lastInput?.shield);
	const mayBlock =
		fighter.shield > 0 &&
		!fighter.attack &&
		!fighter.grabbedBy &&
		fighter.stun <= 0 &&
		fighter.shieldStun <= 0;

	fighter.blocking = Boolean(input.shield && mayBlock);
	if (freshPress && fighter.blocking) {
		fighter.parryFrames = PARRY_FRAMES;
	}

	if (fighter.blocking) {
		fighter.shield = Math.max(0, fighter.shield - 0.32);
		fighter.shieldRegenDelay = 28;
	} else if (fighter.shieldRegenDelay <= 0) {
		fighter.shield = Math.min(fighter.stats.shield, fighter.shield + 0.24);
	}

	if (fighter.shield <= 0) {
		breakShield(fighter);
	}
}

/**
 * Applies one blocked strike and returns the resulting defense event.
 *
 * @param {object} fighter Defending fighter.
 * @param {number} amount Incoming attack damage.
 * @returns {{parried:boolean, broken:boolean, shieldStun:number}} Defense result.
 */
export function shieldAbsorb(fighter, amount) {
	const parried = fighter.parryFrames > 0;
	const shieldDamage = Math.max(1, amount) * (parried ? 0.7 : 2.25);
	fighter.shield = Math.max(0, fighter.shield - shieldDamage);
	fighter.shieldStun = parried ? 2 : Math.min(24, 4 + Math.round(amount * 0.65));
	fighter.shieldRegenDelay = 48;

	const broken = fighter.shield <= 0;
	if (broken) {
		breakShield(fighter);
	}

	return {
		parried,
		broken,
		shieldStun: fighter.shieldStun
	};
}

function breakShield(fighter) {
	fighter.shield = 0;
	fighter.stun = Math.max(fighter.stun || 0, BREAK_STUN);
	fighter.blocking = false;
	fighter.parryFrames = 0;
	fighter.shieldRegenDelay = 110;
}
