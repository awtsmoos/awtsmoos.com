//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the target motion vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Target motion reader.
 *
 * Chapter 50: the bot does not forecast galaxies. It sees the simple human
 * truth: the enemy is moving left, falling, rising, slowing, or charging. That
 * is enough to meet them in the night without forgetting the fist in front.
 */
export function targetMotion(target) {
	const vx = target.vx || 0;
	const vy = target.vy || 0;
	const speed = Math.hypot(vx, vy);
	const dir = Math.sign(vx || target.face || 1) || 1;
	return {
		vx,
		vy,
		speed,
		dir,
		movingHoriz: Math.abs(vx) > 1.6,
		airborne: !target.grounded,
		rising: vy < -1.2,
		falling: vy > 1.2,
		charging:
			Math.max(
				target.charge?.punch || 0,
				target.charge?.kick || 0,
				(target.chargeGlow || 0) * 90
			) > 10
	};
}
