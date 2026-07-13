//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hand lag vessel in this instant, revealing
 * its focused js skeleton secondary service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function handLag(p, f, m, style, body) {
	const s = body.height,
		trail = Math.min(10, Math.abs(f.vx || 0)) * 0.35 * s * style.looseness,
		sg = Math.sign(f.vx || 0);
	p.leftHand.x -= sg * trail;
	p.rightHand.x -= sg * trail;
	if (f.attack) {
		p.leftHand.y += 2 * s;
		p.rightHand.y += 2 * s;
	}
	return p;
}
