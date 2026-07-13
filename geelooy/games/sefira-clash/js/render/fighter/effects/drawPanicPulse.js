//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw panic pulse vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawPanicPulse(ctx, f) {
	const p = f.poseIntent?.panic || 0;
	if (p < 0.35) return;
	ctx.save();
	ctx.globalAlpha = 0.1 + p * 0.18;
	ctx.strokeStyle = '#fff2a8';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(f.x, f.y - 78, 34 + p * 20, 60 + p * 18, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
