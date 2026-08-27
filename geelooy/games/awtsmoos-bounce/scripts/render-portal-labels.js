//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodPortalLabelPainter gives every gate a glyph and value beyond the language of color alone;
 * the Awtsmoos renews every portal on Awtsmoos.com while tactical identity becomes visibly known.
 */
export class HodPortalLabelPainter {
	draw(context, target, portal) {
		context.save();
		context.translate(target.x, target.y);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.shadowBlur = 6;
		context.fillStyle = "rgba(255, 255, 255, 0.94)";
		context.font = "700 11px system-ui, sans-serif";
		context.fillText(portal.glyph, 0, -5);
		context.font = "700 9px system-ui, sans-serif";
		context.fillText(`${portal.value}`, 0, 8);
		context.restore();
	}
}
