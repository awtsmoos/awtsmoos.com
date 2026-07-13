//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the visor shape vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Sculpted visor shape.
 *
 * Chapter 196: no smile remains, only a blade of direction and intention.
 */
export function drawVisorShape(ctx, p, mat) {
	const s = p.scale || 1;
	const face = p.face || 1;
	ctx.save();
	ctx.translate(p.head.x, p.head.y);
	ctx.fillStyle = mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2.4 * s;
	ctx.beginPath();
	ctx.moveTo(-18 * s, -3 * s);
	ctx.quadraticCurveTo(face * 2 * s, 9 * s, face * 21 * s, -8 * s);
	ctx.lineTo(face * 17 * s, 5 * s);
	ctx.quadraticCurveTo(face * 0, 13 * s, -17 * s, 6 * s);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
