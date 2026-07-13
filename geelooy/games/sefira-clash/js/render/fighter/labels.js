//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the labels vessel in this instant, revealing
 * its focused js render fighter service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Cleaner fighter labels.
 *
 * Chapter 225: witness text becomes small and high. It no longer sits on the
 * helmet or screams over the body while the Awtsmoos renews every number.
 */
export function drawLabels(ctx, f) {
	const y = f.y - 196;
	const name = f.human ? 'YOU' : f.name.replace('Bot ', 'B');
	drawOutlinedText(ctx, `${name} ${Math.round(f.damage)}% S${f.stocks}`, f.x, y, 9, '#fff7c9');
	if (f.combo?.count > 2)
		drawOutlinedText(ctx, `${f.combo.count}x`, f.x + 34, y - 14, 12, '#fff4a8');
}

/**
 * Reveals the draw outlined text behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} text The text value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} size The size value entering this behavior.
 * @param {*} fill The fill value entering this behavior.
 */
export function drawOutlinedText(ctx, text, x, y, size, fill) {
	ctx.font = `900 ${size}px system-ui`;
	ctx.textAlign = 'center';
	ctx.strokeStyle = '#000';
	ctx.lineWidth = Math.max(3, size * 0.34);
	ctx.strokeText(text, x, y);
	ctx.fillStyle = fill;
	ctx.fillText(text, x, y);
}
