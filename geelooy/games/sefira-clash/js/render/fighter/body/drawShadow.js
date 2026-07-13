//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw shadow vessel in this instant, revealing
 * its focused js render fighter body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawShadow(ctx, f, color, language) {
	ctx.save();
	ctx.globalAlpha = 0.18 + (f.grounded ? 0.12 : 0);
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.ellipse(f.x, f.y + 8, 42 + Math.abs(f.vx || 0) * 0.6, 9, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
