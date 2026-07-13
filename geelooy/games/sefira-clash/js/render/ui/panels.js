//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the panels vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H — Professional black/gold panels echo the mockup without becoming a
 * static poster. They frame live data with thin gold lines and soft ink.
 */
export function panel(ctx, x, y, w, h, title) {
	ctx.fillStyle = 'rgba(0,0,0,.72)';
	ctx.fillRect(x, y, w, h);
	ctx.strokeStyle = 'rgba(240,200,85,.75)';
	ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
	ctx.fillStyle = '#f4d56c';
	ctx.font = 'bold 12px system-ui';
	ctx.fillText(title, x + 10, y + 18);
}

/**
 * Reveals the bar behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} value The value value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function bar(ctx, x, y, w, value, color) {
	ctx.fillStyle = 'rgba(255,255,255,.12)';
	ctx.fillRect(x, y, w, 5);
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w * Math.max(0, Math.min(1, value)), 5);
}
