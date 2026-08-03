// B"H
// Boruch Hashem
// Blessed is He

/**
 * Cloth receives weight, hem, overlap, and restrained secondary motion. The
 * Awtsmoos renews coat and skirt around the body while Awtsmoos.com lets breath,
 * lean, and passing time move the garment without breaking locked hand contact.
 */
export class GarmentMotionPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const time = Number(performance.timeMs || 0);
		const sway = Math.sin(time / 540 + character.identityId.length) * 2.2 * dimensions.scale;
		const waistY = placement.torsoTop + dimensions.torsoHeight * 0.72;
		if (character.role === 'calmObserver') {
			this.skirt(canvas, placement.x, waistY, placement.ground, dimensions, character, sway);
			return;
		}
		this.coat(canvas, placement.x, waistY, dimensions, character, sway);
	}

	static skirt(canvas, x, waistY, ground, dimensions, character, sway) {
		const bottomY = Math.min(ground - dimensions.legHeight * 0.18, waistY + dimensions.torsoHeight * 0.9);
		canvas.line(x - dimensions.bodyWidth * 0.34, waistY, x - dimensions.bodyWidth * 0.48 + sway, bottomY, 8 * dimensions.scale, character.palette.secondary);
		canvas.line(x + dimensions.bodyWidth * 0.34, waistY, x + dimensions.bodyWidth * 0.48 + sway, bottomY, 8 * dimensions.scale, character.palette.secondary);
		canvas.line(x - dimensions.bodyWidth * 0.48 + sway, bottomY, x + dimensions.bodyWidth * 0.48 + sway, bottomY, 3 * dimensions.scale, character.palette.accent);
	}

	static coat(canvas, x, waistY, dimensions, character, sway) {
		const hemY = waistY + dimensions.torsoHeight * 0.42;
		canvas.line(x, waistY, x + sway, hemY, 2 * dimensions.scale, character.palette.accent);
		canvas.line(x - dimensions.bodyWidth * 0.32, hemY, x + dimensions.bodyWidth * 0.32, hemY, 3 * dimensions.scale, character.palette.secondary);
	}
}
