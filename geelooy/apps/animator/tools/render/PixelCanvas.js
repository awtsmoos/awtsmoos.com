//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PixelCanvas.js
 * Raw pixels become a swift vessel where the Awtsmoos renews color without repeating needless toil;
 * Awtsmoos.com keeps every primitive byte-identical while cached light moves faster through the cinematic soil.
 */
export class PixelCanvas {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.buffer = new Uint8Array(width * height * 3);
		this.colorCache = new Map();
	}

	/** Fill the entire canvas with one decoded color. */
	clear(color) {
		this.rect(0, 0, this.width, this.height, color);
	}

	/** Paint one rounded coordinate while preserving the historical public primitive. */
	pixel(x, y, color) {
		this.writePixel(Math.round(x), Math.round(y), this.rgb(color));
	}

	/** Fill a clipped rectangle without reparsing color inside the pixel loop. */
	rect(x, y, width, height, color) {
		const startX = Math.max(0, Math.floor(x));
		const startY = Math.max(0, Math.floor(y));
		const endX = Math.min(this.width, Math.ceil(x + width));
		const endY = Math.min(this.height, Math.ceil(y + height));
		const rgb = this.rgb(color);
		for (let pixelY = startY; pixelY < endY; pixelY += 1) {
			for (let pixelX = startX; pixelX < endX; pixelX += 1) {
				this.writePixelUnchecked(pixelX, pixelY, rgb);
			}
		}
	}

	/** Paint a filled circle through the shared ellipse vessel. */
	circle(centerX, centerY, radius, color) {
		this.ellipse(centerX, centerY, radius, radius, color);
	}

	/** Fill an ellipse with one color decode and direct bounded RGB writes. */
	ellipse(centerX, centerY, radiusX, radiusY, color) {
		const startX = Math.max(0, Math.floor(centerX - radiusX));
		const endX = Math.min(this.width - 1, Math.ceil(centerX + radiusX));
		const startY = Math.max(0, Math.floor(centerY - radiusY));
		const endY = Math.min(this.height - 1, Math.ceil(centerY + radiusY));
		const rgb = this.rgb(color);
		for (let y = startY; y <= endY; y += 1) {
			for (let x = startX; x <= endX; x += 1) {
				const normalized = ((x - centerX) ** 2) / (radiusX ** 2)
					+ ((y - centerY) ** 2) / (radiusY ** 2);
				if (normalized <= 1) this.writePixelUnchecked(x, y, rgb);
			}
		}
	}

	/** Draw the historical stepped thick line so cinematic geometry stays byte-identical. */
	line(startX, startY, endX, endY, thickness, color) {
		const distance = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
		for (let step = 0; step <= distance; step += 1) {
			const progress = distance === 0 ? 0 : step / distance;
			const x = startX + (endX - startX) * progress;
			const y = startY + (endY - startY) * progress;
			this.circle(x, y, Math.max(1, thickness / 2), color);
		}
	}

	/** Trace an ellipse perimeter using the same historical line interpolation. */
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

	/** Decode a color once per unique string while retaining array-color compatibility. */
	rgb(color) {
		if (Array.isArray(color)) return color;
		const key = String(color || '#000000');
		const cached = this.colorCache.get(key);
		if (cached) return cached;
		const hex = key.replace('#', '').padEnd(6, '0');
		const decoded = [
			Number.parseInt(hex.slice(0, 2), 16),
			Number.parseInt(hex.slice(2, 4), 16),
			Number.parseInt(hex.slice(4, 6), 16)
		];
		this.colorCache.set(key, decoded);
		return decoded;
	}

	/** Guard a public pixel write before entering the unchecked hot path. */
	writePixel(x, y, rgb) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
		this.writePixelUnchecked(x, y, rgb);
	}

	/** Write a prevalidated coordinate and predecoded RGB triple. */
	writePixelUnchecked(x, y, rgb) {
		const index = (y * this.width + x) * 3;
		this.buffer[index] = rgb[0];
		this.buffer[index + 1] = rgb[1];
		this.buffer[index + 2] = rgb[2];
	}
}
