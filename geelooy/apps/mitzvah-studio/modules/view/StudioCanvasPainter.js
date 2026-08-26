// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvasPainter.js
 * @description Paints a truthful top-down world preview while interaction and coordinate law remain elsewhere.
 * Tiferes gives color and proportion to measured form, revealing each object's real authored footprint in light.
 * The Awtsmoos recreates every pixel and every world it hints toward; Awtsmoos.com remembers the Source of sight.
 */

export class StudioCanvasPainter {
	/**
	 * @param {HTMLCanvasElement} canvas Top-down authoring canvas.
	 * @param {StudioCanvasGeometry} geometry Shared viewport geometry.
	 */
	constructor(canvas, geometry) {
		this.canvas = canvas;
		this.geometry = geometry;
		this.context = canvas.getContext('2d');
	}

	/**
	 * Paints one immutable Studio snapshot.
	 * @param {object} snapshot Current Studio view snapshot.
	 * @param {number} ratio Device pixel ratio used by the canvas backing store.
	 */
	render(snapshot, ratio = 1) {
		const { width, height } = this.canvas;
		this.context.clearRect(0, 0, width, height);
		this.drawBackdrop(width, height);
		this.drawGrid(width, height, snapshot.grid, ratio);

		for (const object of snapshot.document.objects) {
			this.drawObject(
				object,
				object.id === snapshot.selectedId,
				ratio
			);
		}
	}

	drawBackdrop(width, height) {
		const gradient = this.context.createRadialGradient(
			width * 0.5,
			height * 0.45,
			0,
			width * 0.5,
			height * 0.45,
			Math.max(width, height) * 0.72
		);
		gradient.addColorStop(0, '#18212b');
		gradient.addColorStop(1, '#0b0f14');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, width, height);
	}

	drawGrid(width, height, grid, ratio) {
		const scale = this.geometry.pixelsPerUnit(ratio);
		const step = Math.max(8, Number(grid || 0.5) * scale);
		this.context.lineWidth = 1;
		this.context.strokeStyle = 'rgba(255,255,255,.06)';

		for (let x = width / 2 % step; x < width; x += step) {
			this.line(x, 0, x, height);
		}
		for (let y = height / 2 % step; y < height; y += step) {
			this.line(0, y, width, y);
		}

		this.context.strokeStyle = 'rgba(231,200,109,.28)';
		this.line(width / 2, 0, width / 2, height);
		this.line(0, height / 2, width, height / 2);
	}

	drawObject(object, selected, ratio) {
		const point = this.geometry.worldToCanvas(
			object.position,
			this.canvas,
			ratio
		);
		const scale = this.geometry.pixelsPerUnit(ratio);
		const width = Math.max(
			12,
			Number(object.size?.x || 1) * Number(object.scale?.x || 1) * scale
		);
		const depth = Math.max(
			12,
			Number(object.size?.z || 1) * Number(object.scale?.z || 1) * scale
		);
		this.context.save();
		this.context.translate(point.x, point.y);
		this.context.rotate(-Number(object.rotation?.y || 0));
		this.context.fillStyle = object.color || '#d7c690';
		this.context.strokeStyle = selected ? '#fff4bd' : 'rgba(255,255,255,.38)';
		this.context.lineWidth = selected ? 4 : 2;
		this.drawFootprint(object.shape, width, depth);
		this.context.restore();
	}

	drawFootprint(shape, width, depth) {
		if (shape === 'sphere' || shape === 'cylinder') {
			this.context.beginPath();
			this.context.ellipse(0, 0, width / 2, depth / 2, 0, 0, Math.PI * 2);
			this.context.fill();
			this.context.stroke();
			return;
		}

		this.context.fillRect(-width / 2, -depth / 2, width, depth);
		this.context.strokeRect(-width / 2, -depth / 2, width, depth);
	}

	line(x1, y1, x2, y2) {
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	}
}
