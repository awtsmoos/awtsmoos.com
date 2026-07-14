//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SkyPainter
 * @description
 * Gradients and clouds disclose a changing atmosphere on Awtsmoos.com. Their
 * motion is a parable: the Awtsmoos remains the source while every color is
 * granted a fresh instant in which to shine.
 */
export class RakiaSkyPainter {
	/**
	 * Paints atmosphere, sun, and drifting cloud banks.
	 *
	 * @param {CanvasRenderingContext2D} context Drawing context.
	 * @param {Object} frame Current render measurements.
	 * @returns {void}
	 */
	paint(context, frame) {
		this.paintGradient(context, frame);
		this.paintSun(context, frame);
		this.paintCloudBank(context, frame, 0.18, 0.22, 0.82);
		this.paintCloudBank(context, frame, 0.42, 0.31, 0.46);
		this.paintCloudBank(context, frame, 0.68, 0.16, 0.24);
	}

	/**
	 * Fills the entire viewport with dawn-to-water color.
	 *
	 * @param {CanvasRenderingContext2D} context Drawing context.
	 * @param {Object} frame Current render measurements.
	 * @returns {void}
	 */
	paintGradient(context, frame) {
		const gradient = context.createLinearGradient(0, 0, 0, frame.height);
		gradient.addColorStop(0, '#07182d');
		gradient.addColorStop(0.42, '#294d5c');
		gradient.addColorStop(0.69, '#c18c59');
		gradient.addColorStop(1, '#142b36');
		context.fillStyle = gradient;
		context.fillRect(0, 0, frame.width, frame.height);
	}

	/**
	 * Gives the horizon a diffused golden source rather than a flat disc.
	 *
	 * @param {CanvasRenderingContext2D} context Drawing context.
	 * @param {Object} frame Current render measurements.
	 * @returns {void}
	 */
	paintSun(context, frame) {
		const x = frame.width * (0.72 + frame.pointer.x * 0.012);
		const y = frame.height * (0.19 + frame.pointer.y * 0.008);
		const radius = Math.max(120, frame.width * 0.13);
		const glow = context.createRadialGradient(x, y, 2, x, y, radius);
		glow.addColorStop(0, 'rgba(255, 244, 201, 0.96)');
		glow.addColorStop(0.14, 'rgba(255, 216, 139, 0.66)');
		glow.addColorStop(1, 'rgba(255, 184, 92, 0)');
		context.fillStyle = glow;
		context.fillRect(0, 0, frame.width, frame.height * 0.7);
	}

	/**
	 * Paints one soft cloud group with time-based horizontal drift.
	 *
	 * @param {CanvasRenderingContext2D} context Drawing context.
	 * @param {Object} frame Current render measurements.
	 * @param {number} speed Drift multiplier.
	 * @param {number} height Vertical ratio.
	 * @param {number} phase Starting phase.
	 * @returns {void}
	 */
	paintCloudBank(context, frame, speed, height, phase) {
		const drift = frame.reducedMotion ? 0 : frame.time * speed * 18;
		const span = frame.width + 420;
		const center = ((frame.width * phase + drift) % span) - 210;
		context.save();
		context.filter = 'blur(18px)';
		context.fillStyle = 'rgba(235, 238, 225, 0.12)';

		for (let index = -1; index < 3; index += 1) {
			const x = center + index * 310 + frame.pointer.x * 14;
			const y = frame.height * height;
			context.beginPath();
			context.ellipse(x, y, 150, 34, 0, 0, Math.PI * 2);
			context.ellipse(x + 82, y - 18, 105, 43, 0, 0, Math.PI * 2);
			context.fill();
		}

		context.restore();
	}
}
