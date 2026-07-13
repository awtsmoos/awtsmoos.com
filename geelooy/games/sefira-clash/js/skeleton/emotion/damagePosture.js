//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the damage posture vessel in this instant, revealing
 * its focused js skeleton emotion service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function damagePosture(p, f, intent, body) {
	const s = body.height,
		c = intent.damageCurl || 0;
	p.chest.y += 8 * c * s;
	p.head.y += 9 * c * s;
	p.head.x -= (f.face || 1) * 5 * c * s;
	p.leftHand.y += 14 * c * s;
	p.rightHand.y += 12 * c * s;
	p.leftFoot.x -= 6 * c * s;
	p.rightFoot.x += 6 * c * s;
	return p;
}
