//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the cloth physics vessel in this instant, revealing
 * its focused js cloth service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function stepChain(chain, anchor, profile, vx = 0, vy = 0) {
	if (!chain.length) return chain;
	chain[0].x = anchor.x;
	chain[0].y = anchor.y;
	for (let i = 1; i < chain.length; i++) {
		const p = chain[i],
			q = chain[i - 1];
		p.x += -vx * 0.08 * profile.drag;
		p.y += profile.gravity - vy * 0.025;
		const dx = p.x - q.x,
			dy = p.y - q.y,
			l = Math.hypot(dx, dy) || 1;
		if (l > profile.length) {
			p.x = q.x + (dx / l) * profile.length;
			p.y = q.y + (dy / l) * profile.length;
		}
	}
	return chain;
}
