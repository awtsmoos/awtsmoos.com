// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterPainter.js
 * @description Paints regional shallow water from directly overhead.
 *
 * The Awtsmoos renews depth, silt, ripple, and floating leaf without creating sky.
 * Awtsmoos.com shares one bounded phase across the living surface.
 */
export class WaterPainter {
	static draw(context, x, y, size, seed, theme) {
		const left = Math.floor(x);
		const top = Math.floor(y);
		const extent = Math.ceil(size) + 1;
		const phase = (performance.now() * 0.00035 + Math.abs(seed) * 0.017) % 1;
		context.save();
		const depth = context.createLinearGradient(left, top, left + size, top + size);
		depth.addColorStop(0, theme.water[0]);
		depth.addColorStop(0.55, theme.water[1]);
		depth.addColorStop(1, theme.water[2]);
		context.fillStyle = depth;
		context.fillRect(left, top, extent, extent);
		this.drawSilt(context, left, top, size, seed, theme);
		this.drawRipples(context, left, top, size, phase, seed, theme);
		this.drawLily(context, left, top, size, seed, theme);
		context.restore();
	}

	static drawSilt(context, x, y, size, seed, theme) {
		context.fillStyle = theme.road[2];
		context.globalAlpha = 0.14;
		for (let index = 0; index < 5; index += 1) {
			const pointX = x + ((Math.abs(seed * (index + 3) * 17) % 83) / 83) * size;
			const pointY = y + ((Math.abs(seed * (index + 5) * 29) % 79) / 79) * size;
			context.beginPath();
			context.arc(pointX, pointY, 1.5 + index * 0.35, 0, Math.PI * 2);
			context.fill();
		}
		context.globalAlpha = 1;
	}

	static drawRipples(context, x, y, size, phase, seed, theme) {
		context.strokeStyle = theme.water[3];
		context.globalAlpha = 0.42;
		context.lineWidth = 1.5;
		for (let index = 0; index < 3; index += 1) {
			const rippleY = y + ((phase + index / 3) % 1) * size;
			const offset = (Math.abs(seed) + index * 11) % 14;
			context.beginPath();
			context.moveTo(x + offset, rippleY);
			context.quadraticCurveTo(x + size / 2, rippleY - 3, x + size - offset, rippleY);
			context.stroke();
		}
		context.globalAlpha = 1;
	}

	static drawLily(context, x, y, size, seed, theme) {
		if (Math.abs(seed) % 5 !== 0) return;
		const centerX = x + size * 0.68;
		const centerY = y + size * 0.34;
		context.fillStyle = theme.props[1];
		context.beginPath();
		context.arc(centerX, centerY, size * 0.08, 0.25, Math.PI * 1.9);
		context.lineTo(centerX, centerY);
		context.fill();
	}
}
