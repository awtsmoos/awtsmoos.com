//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw charge tremble vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawChargeTremble(ctx, f) {
	const c = f.chargeGlow || 0;
	if (c < 0.1) return;
	ctx.save();
	ctx.globalAlpha = 0.12 + c * 0.18;
	ctx.strokeStyle = '#fff2a8';
	ctx.lineWidth = 1 + c * 4;
	for (let i = 0; i < 3; i++) {
		const r = 28 + c * 34 + i * 7 + Math.sin((f.motionClock || 0) * 0.2 + i) * 4;
		ctx.beginPath();
		ctx.arc(f.x, f.y - 90, r, 0, Math.PI * 2);
		ctx.stroke();
	}
	ctx.restore();
}
