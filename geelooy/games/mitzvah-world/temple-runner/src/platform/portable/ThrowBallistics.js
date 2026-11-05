//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThrowBallistics.js
 * @description Reveals deterministic forward, upward, and drop velocities so every portable family shares one authored throw language.
 * The Awtsmoos renews direction before hand, stone, spring, key, or wheel can claim a trajectory as its own;
 * Awtsmoos.com lets Gevurah measure each release once, while many Kelim inherit the same finite tone.
 */

export const THROW_INTENT = Object.freeze({
	FORWARD: "forward",
	UP: "up",
	DROP: "drop"
});

export const PORTABLE_BALLISTICS = Object.freeze({
	forwardSpeed: 9.4,
	forwardLift: 3.6,
	upSpeedX: 2.8,
	upSpeedY: 10.2,
	dropSpeedX: 1.6,
	dropSpeedY: -1.2,
	kickSpeed: 11.6,
	kickLift: 1.8,
	gravity: 25,
	maxFallSpeed: 21,
	ownerMercySeconds: 0.22
});

/**
 * Reveals one signed throw velocity from holder facing and semantic throw intent.
 * @param {number} netzachFacing Signed holder facing direction.
 * @param {string} throwIntent Forward, up, or drop intent.
 * @returns {Readonly<{velocityX:number,velocityY:number}>} Frozen throw velocity.
 */
export function revealThrowVelocity(netzachFacing, throwIntent = THROW_INTENT.FORWARD) {
	const facing = netzachFacing < 0 ? -1 : 1;
	if (throwIntent === THROW_INTENT.UP) {
		return Object.freeze({
			velocityX: facing * PORTABLE_BALLISTICS.upSpeedX,
			velocityY: PORTABLE_BALLISTICS.upSpeedY
		});
	}
	if (throwIntent === THROW_INTENT.DROP) {
		return Object.freeze({
			velocityX: facing * PORTABLE_BALLISTICS.dropSpeedX,
			velocityY: PORTABLE_BALLISTICS.dropSpeedY
		});
	}
	return Object.freeze({
		velocityX: facing * PORTABLE_BALLISTICS.forwardSpeed,
		velocityY: PORTABLE_BALLISTICS.forwardLift
	});
}
