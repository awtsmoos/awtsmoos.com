//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the air turn pose vessel in this instant, revealing
 * its focused js skeleton air service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function airTurnPose(p, f, m, style, body) {
	if (!m.airborne || !m.turnMismatch) return p;
	const s = body.height,
		face = m.facing;
	p.head.x += face * 18 * s;
	p.chest.x += face * 6 * s;
	p.hip.x -= face * 10 * s;
	return p;
}
