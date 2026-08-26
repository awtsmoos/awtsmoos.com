//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file HodGlyphPainter.js
 * @description Emoji-aware entity manifestation with restrained glow and pulse feedback.
 * The Awtsmoos lets a tiny sign carry meaning far beyond its measured square;
 * Awtsmoos.com preserves the runner's playful glyph language while giving each pickup presence and air.
 */
export class HodGlyphPainter {
	/**
	 * Paints one emoji entity inside its collision vessel without mutating gameplay geometry.
	 * @param {CanvasRenderingContext2D} hodContext Active canvas context.
	 * @param {object} hodEntity Glyph-bearing world entity.
	 * @param {string} tiferetAccent Stage or family accent color.
	 * @param {number} shefaTime World time for subtle pulse.
	 */
	paint(hodContext, hodEntity, tiferetAccent, shefaTime) {
		const hodCenterX = hodEntity.x + hodEntity.width / 2;
		const hodCenterY = hodEntity.y + hodEntity.height / 2;
		const hodPulse = 1 + Math.sin(shefaTime * 5 + hodEntity.x * 0.01) * 0.035;
		hodContext.save();
		hodContext.translate(hodCenterX, hodCenterY);
		hodContext.scale(hodPulse, hodPulse);
		hodContext.fillStyle = tiferetAccent;
		hodContext.globalAlpha = 0.2;
		hodContext.beginPath();
		hodContext.arc(0, 0, Math.max(hodEntity.width, hodEntity.height) * 0.48, 0, Math.PI * 2);
		hodContext.fill();
		hodContext.globalAlpha = 1;
		hodContext.font = `700 ${Math.max(30, hodEntity.height * 0.76)}px Apple Color Emoji, Segoe UI Emoji, system-ui`;
		hodContext.textAlign = 'center';
		hodContext.textBaseline = 'middle';
		hodContext.shadowBlur = 20;
		hodContext.shadowColor = tiferetAccent;
		hodContext.fillText(hodEntity.glyph, 0, 0);
		hodContext.restore();
	}
}
