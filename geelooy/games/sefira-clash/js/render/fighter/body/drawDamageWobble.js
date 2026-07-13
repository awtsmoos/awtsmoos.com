//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw damage wobble vessel in this instant, revealing
 * its focused js render fighter body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawDamageWobble(ctx, f, color, language) {
	if (!language.damageWobble) return;
	const h = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
	ctx.save();
	ctx.globalAlpha = 0.18;
	ctx.strokeStyle = '#fff2a8';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(h.x + language.damageWobble, h.y, 22, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
