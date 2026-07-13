//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw contact pulse vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawContactPulse(ctx, f) {
	const c = f.visualContact;
	if (!c?.grounded) return;
	ctx.save();
	ctx.globalAlpha = 0.1 + (c.contactPower || 0) * 0.14;
	ctx.strokeStyle = '#ffffff88';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(f.x - 18, f.y + 3);
	ctx.lineTo(f.x + 18, f.y + 3);
	ctx.stroke();
	ctx.restore();
}
