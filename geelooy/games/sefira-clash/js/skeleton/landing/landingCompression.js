//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the landing compression vessel in this instant, revealing
 * its focused js skeleton landing service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function landingCompression(p, f, m, body) {
	if (f.anim?.kind !== 'landing' && m.landingImpact <= 0.02) return p;
	const s = body.height,
		k = 0.7 + m.landingImpact * 1.2;
	p.chest.y += 18 * k * s;
	p.head.y += 18 * k * s;
	p.leftKnee.y += 18 * k * s;
	p.rightKnee.y += 18 * k * s;
	p.leftFoot.x -= 10 * k * s;
	p.rightFoot.x += 10 * k * s;
	return p;
}
