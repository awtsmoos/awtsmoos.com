//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the human highlight vessel in this instant, revealing
 * its focused js render fighter human service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function drawHumanHighlight(ctx, f, color) {
	if (!f.human) return;
	const h = f.bones?.head?.tip || { x: f.x, y: f.y - 170 };
	ctx.save();
	ctx.globalAlpha = 0.22;
	ctx.strokeStyle = '#fff7b5';
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.ellipse(f.x, (h.y + f.y) / 2, 34, 72, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
