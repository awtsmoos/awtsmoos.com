//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the brake pose vessel in this instant, revealing
 * its focused js skeleton locomotion service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function brakePose(p, f, m, style, body) {
	if (!m.grounded || !m.turnMismatch || m.horizontalSpeed < 5) return p;
	const s = body.height,
		face = m.facing;
	p.chest.x -= face * 20 * s;
	p.head.x -= face * 8 * s;
	p.leftFoot.x -= face * 20 * s;
	p.rightFoot.x -= face * 8 * s;
	p.leftHand.x += face * 18 * s;
	return p;
}
