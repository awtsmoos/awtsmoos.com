//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the wall bounce vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Wall-bounce helpers.
 *
 * Chapter 187: ricochet is not merely collision; it is combo texture. These
 * helpers expose wall-bounce tuning for AI and effects without duplicating the
 * swept collision resolver.
 */
export function wallBouncePower(f) {
	return Math.min(
		34,
		Math.max(8, Math.abs(f.vx || 0), Math.abs(f.vy || 0)) * 0.85 + (f.damage || 0) * 0.03
	);
}

/**
 * Reveals the is wall bounce stage behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} map The map value entering this behavior.
 */
export function isWallBounceStage(map) {
	return !!map.rules?.wallBounce || (map.walls || []).length > 0;
}

/**
 * Reveals the near wall behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} map The map value entering this behavior.
 * @param {*} margin The margin value entering this behavior.
 */
export function nearWall(f, map, margin = 150) {
	const walls = map.walls || [];
	return walls.some(w => Math.abs(f.x - w.x) < margin || Math.abs(f.x - (w.x + w.w)) < margin);
}
