// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseParticlePainter.js
 * @description
 * Deterministic sparks, rain, orbiting motes, and confetti prove particles are
 * real rendered behavior instead of a feature-list promise. The Awtsmoos renews
 * every speck in its instant; Awtsmoos.com keeps the seedless rhythm consistent.
 */
export class ShowcaseParticlePainter {
	/**
	 * @param {import('../PixelCanvas.js').PixelCanvas} canvas Pixel vessel.
	 * @param {number} timeMs Absolute movie time.
	 * @param {'spark'|'rain'|'orbit'|'confetti'} style Particle choreography.
	 */
	static paint(canvas, timeMs, style = 'spark') {
		const seconds = timeMs / 1000;
		for (let index = 0; index < 34; index += 1) {
			const particle = this.resolve(canvas, seconds, index, style);
			canvas.circle(particle.x, particle.y, particle.radius, particle.color);
		}
	}

	static resolve(canvas, seconds, index, style) {
		if (style === 'rain') return this.rain(canvas, seconds, index);
		if (style === 'orbit') return this.orbit(canvas, seconds, index);
		if (style === 'confetti') return this.confetti(canvas, seconds, index);
		return this.spark(canvas, seconds, index);
	}

	/** Rising particles whose phase is repeatable for frame verification. */
	static spark(canvas, seconds, index) {
		const cycle = (seconds * (0.4 + index % 5 * 0.08) + index * 0.071) % 1;
		return {
			x: 96 + index * 13 % Math.max(120, canvas.width - 190),
			y: canvas.height - 62 - cycle * 190,
			radius: 2 + index % 4,
			color: ['#fbbf24', '#fb7185', '#67e8f9', '#a7f3d0'][index % 4]
		};
	}

	/** Fast diagonal storm rain for the dimensional rooftop act. */
	static rain(canvas, seconds, index) {
		const cycle = (seconds * 0.9 + index * 0.053) % 1;
		return {
			x: 54 + ((index * 31 + seconds * 55) % Math.max(100, canvas.width - 108)),
			y: 34 + cycle * Math.max(120, canvas.height - 96),
			radius: index % 3 === 0 ? 3 : 2,
			color: index % 4 === 0 ? '#fef08a' : '#93c5fd'
		};
	}

	/** Circular 3D-like orbital field around a projected center. */
	static orbit(canvas, seconds, index) {
		const angle = seconds * (0.55 + index % 3 * 0.12) + index * 0.47;
		const radius = 38 + index % 8 * 8;
		const depth = (Math.sin(angle * 0.7 + index) + 1) / 2;
		return {
			x: canvas.width * 0.76 + Math.cos(angle) * radius,
			y: 142 + Math.sin(angle) * radius * 0.42,
			radius: 2 + depth * 4,
			color: depth > 0.5 ? '#c4b5fd' : '#67e8f9'
		};
	}

	/** Falling celebration particles with visibly different sizes and colors. */
	static confetti(canvas, seconds, index) {
		const cycle = (seconds * (0.25 + index % 4 * 0.03) + index * 0.093) % 1;
		return {
			x: 26 + (index * 53 % Math.max(80, canvas.width - 52)),
			y: 28 + cycle * Math.max(120, canvas.height - 74),
			radius: 2 + index % 5,
			color: ['#f472b6', '#facc15', '#34d399', '#60a5fa', '#f97316'][index % 5]
		};
	}
}
