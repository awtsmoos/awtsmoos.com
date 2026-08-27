// B"H
// Boruch Hashem
// Blessed is He

/**
 * A hand becomes palm, thumb, fingers, and intention at production scale. The
 * Awtsmoos renews each small silhouette while Awtsmoos.com keeps open, pointing,
 * gripping, resting, and pocketed contact readable instead of one round dot.
 */
export class ReadableHandPainter {
	static paint(canvas, x, y, dimensions, color, side, shape = 'rest') {
		const scale = dimensions.scale;
		if (shape === 'pocket') {
			canvas.ellipse(x, y, 5.5 * scale, 3.2 * scale, color);
			canvas.line(x - side * 5 * scale, y - 2 * scale, x + side * 4 * scale, y + 3 * scale, 1.2 * scale, '#111827');
			return;
		}
		const palmRadius = shape === 'fist' || shape === 'grip' ? 6.5 : 6;
		canvas.ellipse(x, y, palmRadius * scale, 5.2 * scale, '#111827');
		canvas.ellipse(x, y, (palmRadius - 1.2) * scale, 4.1 * scale, color);
		if (shape === 'fist' || shape === 'grip') {
			this.knuckles(canvas, x, y, scale, color, side);
			return;
		}
		if (shape === 'point') {
			canvas.line(x, y - scale, x + side * 12 * scale, y - 2 * scale, 3 * scale, color);
			canvas.circle(x + side * 12 * scale, y - 2 * scale, 1.5 * scale, color);
			this.thumb(canvas, x, y, scale, color, side);
			return;
		}
		if (shape === 'open') {
			for (let finger = -2; finger <= 1; finger += 1) {
				const spread = finger * 2.2 * scale;
				canvas.line(x + side * 2 * scale, y + spread, x + side * (10 + Math.abs(finger)) * scale, y + spread * 1.25, 2 * scale, color);
			}
		}
		this.thumb(canvas, x, y, scale, color, side);
	}

	static thumb(canvas, x, y, scale, color, side) {
		canvas.line(x, y + 2 * scale, x + side * 7 * scale, y + 7 * scale, 2.4 * scale, color);
	}

	static knuckles(canvas, x, y, scale, color, side) {
		for (let index = -1; index <= 1; index += 1) {
			canvas.circle(x + side * index * 2.3 * scale, y - 2.2 * scale, 1.5 * scale, color);
		}
	}
}
