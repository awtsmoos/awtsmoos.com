//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the center of mass vessel in this instant, revealing
 * its focused js skeleton mass service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function centerOfMass(p, f, body) {
	const pts = [p.hip, p.chest, p.head, p.leftFoot, p.rightFoot, p.leftHand, p.rightHand].filter(
		Boolean
	);
	const w = [1.8, 1.5, 0.5, 0.45, 0.45, 0.25, 0.25];
	let sx = 0,
		sy = 0,
		sw = 0;
	for (let i = 0; i < pts.length; i++) {
		sx += pts[i].x * (w[i] || 1);
		sy += pts[i].y * (w[i] || 1);
		sw += w[i] || 1;
	}
	return { x: sx / (sw || 1), y: sy / (sw || 1) };
}
