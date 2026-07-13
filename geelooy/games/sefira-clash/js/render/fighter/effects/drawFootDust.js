//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw foot dust vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawFootDust(ctx, f, color) {
	const c = f.visualContact;
	if (!c?.grounded || c.contactPower < 0.25) return;
	ctx.save();
	ctx.globalAlpha = 0.12 + c.contactPower * 0.16;
	ctx.fillStyle = color;
	const x = c.leftPlanted ? f.bones.leftCalf?.tip?.x : f.bones.rightCalf?.tip?.x;
	ctx.beginPath();
	ctx.ellipse(x || f.x, f.y + 5, 8 + c.contactPower * 12, 3, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
