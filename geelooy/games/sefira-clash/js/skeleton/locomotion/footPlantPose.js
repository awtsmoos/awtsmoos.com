//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the foot plant pose vessel in this instant, revealing
 * its focused js skeleton locomotion service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function footPlantPose(p, f, m, style, body) {
	if (!m.grounded) return p;
	const s = body.height,
		left = m.footPhase < 0.5,
		foot = left ? p.leftFoot : p.rightFoot;
	foot.y = f.y + 2;
	foot.x += (left ? -1 : 1) * Math.min(6, m.horizontalSpeed) * s;
	return p;
}
