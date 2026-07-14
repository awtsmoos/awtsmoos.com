//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EarthPainter
 * @description
 * Hills, water, and reeds give the covenant a believable place to inhabit.
 * Awtsmoos.com receives their depth while the Awtsmoos grants every apparent
 * distance its existence anew.
 */
export class AretzEarthPainter {
	/** Paints the complete lower world. @param {CanvasRenderingContext2D} context @param {Object} frame */
	paint(context, frame) {
		this.paintRidge(context, frame, 0.54, '#253f46', 0.012, 78);
		this.paintRidge(context, frame, 0.62, '#17323a', 0.024, 105);
		this.paintWater(context, frame);
		this.paintShore(context, frame);
		this.paintReeds(context, frame);
	}

	/**
	 * Draws one deterministic organic horizon layer.
	 * @param {CanvasRenderingContext2D} context @param {Object} frame
	 * @param {number} baseline @param {string} color @param {number} parallax @param {number} amplitude
	 */
	paintRidge(context, frame, baseline, color, parallax, amplitude) {
		const baseY = frame.height * baseline + frame.pointer.y * frame.height * parallax;
		context.beginPath();
		context.moveTo(0, frame.height);

		for (let x = 0; x <= frame.width + 24; x += 24) {
			const wave = Math.sin(x * 0.006 + parallax * 190) * amplitude;
			const detail = Math.sin(x * 0.017 + 1.7) * amplitude * 0.23;
			context.lineTo(x, baseY - wave - detail);
		}

		context.lineTo(frame.width, frame.height);
		context.closePath();
		context.fillStyle = color;
		context.fill();
	}

	/** Paints reflective water and moving light ribbons. @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintWater(context, frame) {
		const top = frame.height * 0.62;
		const gradient = context.createLinearGradient(0, top, 0, frame.height);
		gradient.addColorStop(0, 'rgba(32, 66, 72, 0.92)');
		gradient.addColorStop(1, 'rgba(5, 19, 28, 1)');
		context.fillStyle = gradient;
		context.fillRect(0, top, frame.width, frame.height - top);
		context.strokeStyle = 'rgba(244, 199, 113, 0.12)';
		context.lineWidth = 1;

		for (let row = 0; row < 18; row += 1) {
			const y = top + 14 + row * 20;
			const drift = frame.reducedMotion ? 0 : Math.sin(frame.time * 0.55 + row) * 18;
			context.beginPath();
			context.moveTo(frame.width * 0.48 + drift - row * 9, y);
			context.lineTo(frame.width * 0.85 + drift + row * 8, y);
			context.stroke();
		}
	}

	/** Paints a grounded foreground bank. @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintShore(context, frame) {
		const gradient = context.createLinearGradient(0, frame.height * 0.82, 0, frame.height);
		gradient.addColorStop(0, 'rgba(15, 42, 36, 0.5)');
		gradient.addColorStop(1, '#04110f');
		context.fillStyle = gradient;
		context.beginPath();
		context.moveTo(0, frame.height * 0.89);
		context.quadraticCurveTo(frame.width * 0.45, frame.height * 0.8, frame.width, frame.height * 0.9);
		context.lineTo(frame.width, frame.height);
		context.lineTo(0, frame.height);
		context.closePath();
		context.fill();
	}

	/** Paints low-cost animated reed silhouettes. @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintReeds(context, frame) {
		context.strokeStyle = 'rgba(3, 20, 16, 0.88)';
		context.lineWidth = 2;

		for (let index = 0; index < 42; index += 1) {
			const x = (index / 41) * frame.width;
			const height = 24 + (index % 7) * 8;
			const sway = frame.reducedMotion ? 0 : Math.sin(frame.time + index) * 4;
			context.beginPath();
			context.moveTo(x, frame.height);
			context.quadraticCurveTo(x + sway, frame.height - height * 0.55, x + sway * 1.4, frame.height - height);
			context.stroke();
		}
	}
}
