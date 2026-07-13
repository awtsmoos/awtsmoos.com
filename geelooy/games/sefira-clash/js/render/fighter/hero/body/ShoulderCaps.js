//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shoulder caps vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Flattened shoulder caps.
 *
 * Chapter 219: the shoulder bubbles are cut down into slim armor pads. The
 * fighter becomes less toy-like and more like the reference silhouette.
 */
export function drawShoulderCaps(ctx, p, mat) {
	const s = p.scale || 1;
	drawCap(ctx, p.leftShoulder, -1, mat, s);
	drawCap(ctx, p.rightShoulder, 1, mat, s);
}

function drawCap(ctx, c, sign, mat, s) {
	ctx.save();
	ctx.translate(c.x + sign * 2 * s, c.y + 5 * s);
	ctx.rotate(sign * 0.16);
	ctx.fillStyle = mat.shellSoft;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 1.9 * s;
	ctx.beginPath();
	ctx.ellipse(0, 0, 11 * s, 5.5 * s, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
