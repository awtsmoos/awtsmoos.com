//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the foot slip vessel in this instant, revealing
 * its focused js skeleton feet service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function footSlip(p, f, metrics, body, phase) {
	if (!metrics.grounded || metrics.horizontalSpeed < 10) return p;
	const s = body.height,
		free = phase.left ? p.rightFoot : p.leftFoot;
	free.x -= metrics.movingDirection * Math.min(9, metrics.horizontalSpeed * 0.45) * s;
	return p;
}
