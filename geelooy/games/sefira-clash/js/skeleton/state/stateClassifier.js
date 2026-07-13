//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the state classifier vessel in this instant, revealing
 * its focused js skeleton state service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function stateClassifier(f) {
	const vy = f.vy || 0,
		s = Math.abs(f.vx || 0),
		c = f.chargeGlow || 0,
		g = !!f.grounded;
	if (f.grabbedBy) return 'grabbed';
	if (f.ledgeHang) return 'ledgeHang';
	if (f.stun > 0) return 'hitstun';
	if (f.blocking) return 'shield';
	if (f.attack) return 'attack:' + f.attack.id;
	if (c > 0.08) return c > 0.92 ? 'maxCharge' : 'charge';
	if (f.landingLag > 0) return 'landing';
	if (g && f.lastInput?.y > 0.45) return 'squat';
	if (!g && f.fastFalling) return 'fastFall';
	if (!g && vy < -4) return 'rise';
	if (!g && Math.abs(vy) <= 1.4) return 'apex';
	if (!g && vy > 1) return 'fall';
	return s > 1.2 ? 'run' : 'idle';
}
