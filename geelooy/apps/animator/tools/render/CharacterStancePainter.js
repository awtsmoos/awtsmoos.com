// B"H
// Boruch Hashem
// Blessed is He

/**
 * Standing, sitting, and crouching are different geometries, not labels. The
 * Awtsmoos renews posture through the whole body while Awtsmoos.com gives each
 * pose a changed center of gravity and readable silhouette.
 */
export class CharacterStancePainter {
	static dimensions(dimensions, pose) {
		if (pose === 'seated') {
			return {
				...dimensions,
				legHeight: dimensions.legHeight * 0.58,
				torsoHeight: dimensions.torsoHeight * 0.94
			};
		}
		if (pose === 'crouched') {
			return {
				...dimensions,
				legHeight: dimensions.legHeight * 0.44,
				torsoHeight: dimensions.torsoHeight * 0.86
			};
		}
		return dimensions;
	}

	static behind(canvas, x, ground, dimensions, pose) {
		if (pose !== 'seated') {
			return;
		}
		const width = dimensions.bodyWidth * 1.28;
		const seatY = ground - dimensions.legHeight * 0.5;
		canvas.rect(x - width * 0.5, seatY, width, 10 * dimensions.scale, '#5b3a29');
		canvas.rect(x - width * 0.48, seatY - 58 * dimensions.scale, 9 * dimensions.scale, 62 * dimensions.scale, '#3d2b1f');
		canvas.rect(x + width * 0.39, seatY - 58 * dimensions.scale, 9 * dimensions.scale, 62 * dimensions.scale, '#3d2b1f');
		canvas.rect(x - width * 0.5, seatY + 6 * dimensions.scale, 8 * dimensions.scale, 42 * dimensions.scale, '#3d2b1f');
		canvas.rect(x + width * 0.42, seatY + 6 * dimensions.scale, 8 * dimensions.scale, 42 * dimensions.scale, '#3d2b1f');
	}
}
