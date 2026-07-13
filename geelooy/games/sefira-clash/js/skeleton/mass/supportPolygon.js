//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the support polygon vessel in this instant, revealing
 * its focused js skeleton mass service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function supportPolygon(p, m) {
	if (!m.grounded)
		return {
			left: p.leftFoot,
			right: p.rightFoot,
			width: 0,
			center: { x: (p.leftFoot.x + p.rightFoot.x) / 2, y: (p.leftFoot.y + p.rightFoot.y) / 2 }
		};
	const left = p.leftFoot.x < p.rightFoot.x ? p.leftFoot : p.rightFoot,
		right = p.leftFoot.x < p.rightFoot.x ? p.rightFoot : p.leftFoot;
	return {
		left,
		right,
		width: Math.abs(right.x - left.x),
		center: { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 }
	};
}
