//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the human danger pulse vessel in this instant, revealing
 * its focused js render fighter human service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real helper vessel: visual-only mapped completion.
 */
export function drawHumanDangerPulse(ctx, f) {
	if (!f.human) return;
	const p = f.poseIntent?.panic || 0,
		d = f.damage || 0;
	if (p < 0.35 && d < 120) return;
	ctx.save();
	ctx.globalAlpha = 0.12 + p * 0.2;
	ctx.strokeStyle = '#fff2a8';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(f.x, f.y - 86, 42 + p * 22 + Math.sin((f.motionClock || 0) * 0.2) * 5, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
