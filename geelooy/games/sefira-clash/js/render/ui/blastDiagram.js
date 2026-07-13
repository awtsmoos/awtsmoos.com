//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the blast diagram vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H � Blast-zone reference panel. It turns invisible death boundaries into
 * a small diagram like the mockup, useful for players and debugging alike.
 */
export function drawBlastDiagram(ctx, state, x, y, w, h) {
	ctx.strokeStyle = 'rgba(80,255,120,.75)';
	ctx.strokeRect(x + 18, y + 18, w - 36, h - 36);
	ctx.strokeStyle = 'rgba(255,220,60,.85)';
	ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
	ctx.strokeStyle = 'rgba(255,60,60,.85)';
	ctx.strokeRect(x, y, w, h);
	ctx.fillStyle = '#fff1c0';
	ctx.font = '9px system-ui';
	ctx.fillText('safe', x + w + 8, y + 24);
	ctx.fillText('warning', x + w + 8, y + 42);
	ctx.fillText('blast', x + w + 8, y + 60);
}
