//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw expression vessel in this instant, revealing
 * its focused js render fighter head service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Draw facial expression accents from active animation state. Visual only.
 */
export function drawExpression(ctx, f, x, y, color, language) {
	const panic = f.poseIntent?.panic || 0;
	const hunt = f.poseIntent?.hunt || 0;
	const damage = f.visualStyle?.damage?.wobble || 0;
	ctx.save();
	ctx.strokeStyle = panic > 0.5 ? '#fff2a8' : color;
	ctx.lineWidth = 2;
	ctx.globalAlpha = 0.35 + Math.max(panic, hunt, damage) * 0.35;
	ctx.beginPath();
	ctx.moveTo(x - 8, y + 10 + damage * 3);
	ctx.quadraticCurveTo(x, y + 13 + panic * 4 - hunt * 5, x + 8, y + 10 + damage * 3);
	ctx.stroke();
	ctx.restore();
}
