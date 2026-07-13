//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ring vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Fighter ground ring.
 *
 * Chapter 137: every fighter stands on a revealed circle, a small mark that
 * says: here is the vessel, here is the player, here is the moment.
 */
export function drawGroundRing(ctx, p, color, human) {
	ctx.save();
	ctx.globalAlpha = human ? 0.72 : 0.38;
	ctx.strokeStyle = color;
	ctx.lineWidth = human ? 3 : 2;
	ctx.beginPath();
	ctx.ellipse(p.pelvis.x, Math.max(p.leftFoot.y, p.rightFoot.y) + 4, 37, 8, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
