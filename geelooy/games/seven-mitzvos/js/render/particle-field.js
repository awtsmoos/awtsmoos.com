//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ParticleField
 * @description
 * Small lights cross the air of Awtsmoos.com like sparks carried above water.
 * Each one appears independent, while the Awtsmoos gives all of them one
 * continuous source and renews their paths in every frame.
 */
export class ChaiParticleField {
	/**
	 * Creates a deterministic field so the landscape remains stable on reload.
	 *
	 * @param {number} count Number of visible sparks.
	 */
	constructor(count = 52) {
		this.particles = Array.from({ length: count }, (_, index) => this.createParticle(index));
	}

	/**
	 * Paints drifting lights with inexpensive circles and soft glow.
	 *
	 * @param {CanvasRenderingContext2D} context Drawing context.
	 * @param {Object} frame Current render measurements.
	 * @returns {void}
	 */
	paint(context, frame) {
		context.save();
		context.globalCompositeOperation = 'screen';

		for (const particle of this.particles) {
			const drift = frame.reducedMotion ? 0 : frame.time * particle.speed;
			const x = ((particle.x * frame.width + drift) % (frame.width + 80)) - 40;
			const wave = Math.sin(frame.time * particle.wave + particle.phase) * 12;
			const y = particle.y * frame.height + wave;
			const alpha = particle.alpha * (0.7 + Math.sin(frame.time + particle.phase) * 0.3);
			const glow = context.createRadialGradient(x, y, 0, x, y, particle.radius * 5);
			glow.addColorStop(0, `rgba(255, 229, 157, ${alpha})`);
			glow.addColorStop(1, 'rgba(255, 201, 111, 0)');
			context.fillStyle = glow;
			context.beginPath();
			context.arc(x, y, particle.radius * 5, 0, Math.PI * 2);
			context.fill();
		}

		context.restore();
	}

	/**
	 * Produces one stable particle from a compact integer hash.
	 *
	 * @param {number} index Particle index.
	 * @returns {Object} Particle properties.
	 */
	createParticle(index) {
		const first = this.fraction(Math.sin(index * 91.17) * 43758.5453);
		const second = this.fraction(Math.sin(index * 47.31 + 2) * 24634.6345);
		const third = this.fraction(Math.sin(index * 19.73 + 7) * 94513.1247);

		return {
			x: first,
			y: 0.12 + second * 0.72,
			radius: 0.7 + third * 1.4,
			speed: 4 + first * 10,
			wave: 0.35 + second * 0.8,
			phase: third * Math.PI * 2,
			alpha: 0.14 + first * 0.28
		};
	}

	/**
	 * Returns the positive fractional part of a number.
	 *
	 * @param {number} value Source number.
	 * @returns {number} Value between zero and one.
	 */
	fraction(value) {
		return value - Math.floor(value);
	}
}
