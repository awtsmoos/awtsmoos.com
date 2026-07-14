//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EarthPainter
 * @description
 * The ground is painted once and then allowed to rest beneath the game.
 * Awtsmoos.com keeps its water, hills, and reeds while the Awtsmoos reveals
 * that stillness can carry as much depth as constant motion.
 */
export class AretzEarthPainter {
	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paint(context, frame) {
		this.paintRidge(context, frame, 0.54, '#253f46', 78);
		this.paintRidge(context, frame, 0.62, '#17323a', 105);
		this.paintWater(context, frame);
		this.paintShore(context, frame);
		this.paintReeds(context, frame);
	}

	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param {Object} frame
	 * @param {number} baseline
	 * @param {string} color
	 * @param {number} amplitude
	 */
	paintRidge(context, frame, baseline, color, amplitude) {
		const baseY = frame.height * baseline;
		context.beginPath();
		context.moveTo(0, frame.height);

		for (let x = 0; x <= frame.width + 24; x += 24) {
			const wave = Math.sin(x * 0.006 + baseline * 17) * amplitude;
			const detail = Math.sin(x * 0.017 + 1.7) * amplitude * 0.23;
			context.lineTo(x, baseY - wave - detail);
		}

		context.lineTo(frame.width, frame.height);
		context.closePath();
		context.fillStyle = color;
		context.fill();
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintWater(context, frame) {
		const top = frame.height * 0.62;
		const gradient = context.createLinearGradient(0, top, 0, frame.height);
		gradient.addColorStop(0, 'rgba(32, 66, 72, 0.92)');
		gradient.addColorStop(1, 'rgba(5, 19, 28, 1)');
		context.fillStyle = gradient;
		context.fillRect(0, top, frame.width, frame.height - top);
		context.strokeStyle = 'rgba(244, 199, 113, 0.13)';

		for (let row = 0; row < 12; row += 1) {
			const y = top + 18 + row * 25;
			context.beginPath();
			context.moveTo(frame.width * 0.48 - row * 8, y);
			context.lineTo(frame.width * 0.85 + row * 8, y);
			context.stroke();
		}
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintShore(context, frame) {
		context.fillStyle = '#061712';
		context.beginPath();
		context.moveTo(0, frame.height * 0.89);
		context.quadraticCurveTo(frame.width * 0.45, frame.height * 0.8, frame.width, frame.height * 0.9);
		context.lineTo(frame.width, frame.height);
		context.lineTo(0, frame.height);
		context.closePath();
		context.fill();
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintReeds(context, frame) {
		context.strokeStyle = 'rgba(3, 20, 16, 0.9)';
		context.lineWidth = 2;

		for (let index = 0; index < 28; index += 1) {
			const x = (index / 27) * frame.width;
			const height = 26 + (index % 7) * 8;
			context.beginPath();
			context.moveTo(x, frame.height);
			context.quadraticCurveTo(x + 3, frame.height - height * 0.55, x + 5, frame.height - height);
			context.stroke();
		}
	}
}
