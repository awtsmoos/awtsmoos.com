//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the shape vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 body primitive helpers. */
export function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}
/**
 * Reveals the segment behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} a The a value entering this behavior.
 * @param {*} b The b value entering this behavior.
 * @param {*} width The width value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 * @param {*} dark The dark value entering this behavior.
 */
export function segment(ctx, a, b, width, mat, dark = false) {
	const dx = b.x - a.x,
		dy = b.y - a.y,
		len = Math.hypot(dx, dy);
	if (len < 2) return;
	ctx.save();
	ctx.translate(a.x, a.y);
	ctx.rotate(Math.atan2(dy, dx));
	ctx.fillStyle = dark ? mat.soft : mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2;
	roundRect(ctx, 0, -width / 2, len, width, width / 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
