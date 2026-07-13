//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shoulder vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 flat shoulder pads. */
export function drawShoulders(ctx, p, mat) {
	cap(ctx, p.leftShoulder, -1, mat);
	cap(ctx, p.rightShoulder, 1, mat);
}
function cap(ctx, c, sign, mat) {
	ctx.save();
	ctx.translate(c.x + sign * 2, c.y + 5);
	ctx.rotate(sign * 0.16);
	ctx.fillStyle = mat.soft;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 1.8;
	ctx.beginPath();
	ctx.ellipse(0, 0, 11, 5.5, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
