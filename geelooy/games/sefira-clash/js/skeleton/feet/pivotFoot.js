//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pivot foot vessel in this instant, revealing
 * its focused js skeleton feet service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function pivotFoot(p, f, metrics, body, phase) {
	if (!metrics.grounded || metrics.turnTimer < 0.2) return p;
	const s = body.height,
		foot = phase.left ? p.leftFoot : p.rightFoot;
	foot.x -= metrics.facing * 5 * metrics.turnTimer * s;
	p.hip.x -= metrics.facing * 3 * metrics.turnTimer * s;
	return p;
}
