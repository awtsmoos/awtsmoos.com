//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charge pose vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function chargePose(p, f, m, body, intent) {
	const s = body.height,
		c = intent.charge || 0,
		face = m.facing,
		tr = Math.sin(c * 40 + p.chest.x * 0.03) * c * 7 * s;
	if (!c) return p;
	p.chest.x -= face * (10 + c * 16) * s;
	p.head.y += c * 5 * s;
	p.rightHand.x += face * (18 + c * 22) * s - tr;
	p.leftHand.x += tr;
	return p;
}
