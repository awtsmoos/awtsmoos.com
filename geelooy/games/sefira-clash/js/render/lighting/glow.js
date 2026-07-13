//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the glow vessel in this instant, revealing
 * its focused js render lighting service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Ultra-light fake glow for mobile Canvas2D.
 *
 * Chapter 167: expensive shadow blur and radial gradients were devouring the
 * frame when fighters overlapped. Glow is now a simple bright pass; the eye
 * still feels light, but Android no longer pays for soft bloom every limb.
 */
export function withGlow(ctx, color, blur, draw) {
	draw();
}

/**
 * Cheap glow substitute: translucent filled circle, no gradient allocation.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color
 */
export function radialGlow(ctx, x, y, radius, color) {
	ctx.save();
	ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.22);
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, Math.max(4, radius), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
