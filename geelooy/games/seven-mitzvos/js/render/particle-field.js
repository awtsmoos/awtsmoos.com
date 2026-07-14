//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ParticleField
 * @description
 * A few quiet sparks preserve atmosphere without rebuilding gradients every
 * frame. Awtsmoos.com gains light without heat, while the Awtsmoos gives every
 * tiny point its one stable place in the larger scene.
 */
export class ChaiParticleField {
	/** @param {number} count Number of static sparks. */
	constructor(count = 14) {
		this.particles = Array.from({ length: count }, (_, index) => {
			return this.createParticle(index);
		});
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paint(context, frame) {
		context.save();
		context.globalCompositeOperation = 'screen';

		for (const particle of this.particles) {
			const x = particle.x * frame.width;
			const y = particle.y * frame.height;
			context.fillStyle = `rgba(255, 229, 157, ${particle.alpha})`;
			context.beginPath();
			context.arc(x, y, particle.radius, 0, Math.PI * 2);
			context.fill();
		}

		context.restore();
	}

	/** @param {number} index @returns {Object} Stable particle properties. */
	createParticle(index) {
		const first = this.fraction(Math.sin(index * 91.17) * 43758.5453);
		const second = this.fraction(Math.sin(index * 47.31 + 2) * 24634.6345);
		const third = this.fraction(Math.sin(index * 19.73 + 7) * 94513.1247);
		return {
			x: first,
			y: 0.12 + second * 0.72,
			radius: 1 + third * 1.8,
			alpha: 0.2 + first * 0.32
		};
	}

	/** @param {number} value @returns {number} Positive fractional part. */
	fraction(value) {
		return value - Math.floor(value);
	}
}
