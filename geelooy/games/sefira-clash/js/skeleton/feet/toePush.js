//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the toe push vessel in this instant, revealing
 * its focused js skeleton feet service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function toePush(p, f, metrics, body, phase) {
	if (!metrics.grounded) return p;
	const s = body.height,
		k = Math.max(0, -phase.roll) * Math.min(1, metrics.horizontalSpeed / 8);
	const foot = phase.left ? p.leftFoot : p.rightFoot;
	foot.x += metrics.movingDirection * k * 6 * s;
	foot.y -= k * 2 * s;
	return p;
}
