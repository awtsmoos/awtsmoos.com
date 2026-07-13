//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw hunter glint vessel in this instant, revealing
 * its focused js render fighter effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawHunterGlint(ctx, f) {
	if (!(f.poseIntent?.hunt > 0.5)) return;
	const h = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
	ctx.save();
	ctx.globalAlpha = 0.5;
	ctx.strokeStyle = '#fff7b5';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(h.x + (f.face || 1) * 4, h.y - 4);
	ctx.lineTo(h.x + (f.face || 1) * 16, h.y - 5);
	ctx.stroke();
	ctx.restore();
}
