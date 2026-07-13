// B"H
// Boruch Hashem
// Blessed is He

/**
 * Raw pixels become a canvas without external packages. Each primitive is a
 * humble vessel through which the Awtsmoos reveals an original cartoon frame.
 */
export class PixelCanvas {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.buffer = Buffer.alloc(width * height * 3);
	}

	clear(color) {
		this.rect(0, 0, this.width, this.height, color);
	}

	pixel(x, y, color) {
		const px = Math.round(x);
		const py = Math.round(y);
		if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
		const index = (py * this.width + px) * 3;
		const [red, green, blue] = this.rgb(color);
		this.buffer[index] = red;
		this.buffer[index + 1] = green;
		this.buffer[index + 2] = blue;
	}

	rect(x, y, width, height, color) {
		const startX = Math.max(0, Math.floor(x));
		const startY = Math.max(0, Math.floor(y));
		const endX = Math.min(this.width, Math.ceil(x + width));
		const endY = Math.min(this.height, Math.ceil(y + height));
		const [red, green, blue] = this.rgb(color);
		for (let py = startY; py < endY; py += 1) {
			for (let px = startX; px < endX; px += 1) {
				const index = (py * this.width + px) * 3;
				this.buffer[index] = red;
				this.buffer[index + 1] = green;
				this.buffer[index + 2] = blue;
			}
		}
	}

	circle(centerX, centerY, radius, color) {
		this.ellipse(centerX, centerY, radius, radius, color);
	}

	ellipse(centerX, centerY, radiusX, radiusY, color) {
		const startX = Math.floor(centerX - radiusX);
		const endX = Math.ceil(centerX + radiusX);
		const startY = Math.floor(centerY - radiusY);
		const endY = Math.ceil(centerY + radiusY);
		for (let y = startY; y <= endY; y += 1) {
			for (let x = startX; x <= endX; x += 1) {
				const normalized = ((x - centerX) ** 2) / (radiusX ** 2)
					+ ((y - centerY) ** 2) / (radiusY ** 2);
				if (normalized <= 1) this.pixel(x, y, color);
			}
		}
	}

	line(startX, startY, endX, endY, thickness, color) {
		const distance = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
		for (let step = 0; step <= distance; step += 1) {
			const progress = distance === 0 ? 0 : step / distance;
			const x = startX + (endX - startX) * progress;
			const y = startY + (endY - startY) * progress;
			this.circle(x, y, Math.max(1, thickness / 2), color);
		}
	}

	outlineEllipse(centerX, centerY, radiusX, radiusY, thickness, color) {
		const steps = Math.max(24, Math.round(Math.PI * Math.max(radiusX, radiusY)));
		let previous = null;
		for (let index = 0; index <= steps; index += 1) {
			const angle = index / steps * Math.PI * 2;
			const point = [centerX + Math.cos(angle) * radiusX, centerY + Math.sin(angle) * radiusY];
			if (previous) this.line(previous[0], previous[1], point[0], point[1], thickness, color);
			previous = point;
		}
	}

	rgb(color) {
		if (Array.isArray(color)) return color;
		const hex = String(color || '#000000').replace('#', '').padEnd(6, '0');
		return [
			Number.parseInt(hex.slice(0, 2), 16),
			Number.parseInt(hex.slice(2, 4), 16),
			Number.parseInt(hex.slice(4, 6), 16)
		];
	}
}
