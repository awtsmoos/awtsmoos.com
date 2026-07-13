//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack phase vessel in this instant, revealing
 * its focused js skeleton combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function attackPhase(f) {
	if (!f.attack) return { name: 'none', t: 0, anticipation: 0, extension: 0, recoil: 0 };
	const s = Math.max(1, f.attack.startup || 1),
		e = s + Math.max(1, f.attack.active || 1),
		fr = f.attackFrame || 0;
	if (fr <= s) {
		const t = fr / s;
		return { name: 'startup', t, anticipation: 1 - t, extension: t * 0.55, recoil: 0 };
	}
	if (fr <= e) return { name: 'active', t: 1, anticipation: 0, extension: 1, recoil: 0 };
	const r = Math.max(1, f.attack.recovery || 1),
		t = Math.max(0.2, 1 - ((fr - e) / r) * 0.8);
	return { name: 'recovery', t, anticipation: 0, extension: t, recoil: 1 - t };
}
