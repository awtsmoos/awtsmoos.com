// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseShapePainter.js
 * @description
 * Rectangles, circles, paths, arrows, patches, and wire depth move as real pixels.
 * The Awtsmoos renews each point before the next point may appear; Awtsmoos.com
 * lets humble geometry rhyme with cinema, so AI intent becomes visible light here.
 */
export class ShowcaseShapePainter {
	/**
	 * @param {import('../PixelCanvas.js').PixelCanvas} canvas Render vessel.
	 * @param {number} timeMs Absolute movie time.
	 * @param {number} variant Geometry family selector.
	 */
	static paint(canvas, timeMs, variant = 0) {
		const phase = timeMs / 1000;
		const pulse = (Math.sin(phase * 2.1) + 1) / 2;
		canvas.rect(24 + pulse * 46, 48, 88, 22, '#f4c95d');
		canvas.circle(154 + Math.sin(phase) * 24, 59, 15 + pulse * 7, '#6ee7f2');
		canvas.ellipse(224, 59, 30 + pulse * 10, 11, '#ff8f70');
		this.wave(canvas, phase, 300, 62);
		this.arrow(canvas, 402, 62, 486 + pulse * 34, 62);
		if (variant >= 1) this.patch(canvas, 36, 92, phase);
		if (variant >= 2) this.cube(canvas, 470, 122, phase);
	}

	/** Draws a continuously animated path. */
	static wave(canvas, phase, startX, centerY) {
		let previous = [startX, centerY];
		for (let index = 1; index <= 12; index += 1) {
			const x = startX + index * 8;
			const y = centerY + Math.sin(phase * 2 + index * 0.7) * 14;
			canvas.line(previous[0], previous[1], x, y, 3, '#a7f3d0');
			previous = [x, y];
		}
	}

	/** Draws an animated arrow with a real line and head. */
	static arrow(canvas, startX, startY, endX, endY) {
		canvas.line(startX, startY, endX, endY, 4, '#f8fafc');
		canvas.line(endX, endY, endX - 15, endY - 10, 4, '#f8fafc');
		canvas.line(endX, endY, endX - 15, endY + 10, 4, '#f8fafc');
	}

	/** Draws a changing patch grid rather than one static texture. */
	static patch(canvas, startX, startY, phase) {
		for (let row = 0; row < 4; row += 1) {
			for (let column = 0; column < 8; column += 1) {
				const warm = Math.sin(phase * 2 + row + column) > 0;
				const color = warm ? '#fb7185' : '#60a5fa';
				canvas.rect(startX + column * 14, startY + row * 14, 11, 11, color);
			}
		}
	}

	/** Draws a rotating pseudo-3D wire cube using projected front/back faces. */
	static cube(canvas, centerX, centerY, phase) {
		const drift = Math.sin(phase * 1.4) * 12;
		const front = [centerX - 28, centerY - 28, centerX + 28, centerY + 28];
		const back = front.map((value, index) => value + (index % 2 ? -drift : drift));
		this.box(canvas, front, '#c4b5fd');
		this.box(canvas, back, '#67e8f9');
		for (let index = 0; index < 4; index += 1) {
			const corner = this.corner(front, index);
			const depthCorner = this.corner(back, index);
			canvas.line(corner[0], corner[1], depthCorner[0], depthCorner[1], 2, '#f8fafc');
		}
	}

	static box(canvas, box, color) {
		const [left, top, right, bottom] = box;
		canvas.line(left, top, right, top, 2, color);
		canvas.line(right, top, right, bottom, 2, color);
		canvas.line(right, bottom, left, bottom, 2, color);
		canvas.line(left, bottom, left, top, 2, color);
	}

	static corner(box, index) {
		const [left, top, right, bottom] = box;
		return [[left, top], [right, top], [right, bottom], [left, bottom]][index];
	}
}
