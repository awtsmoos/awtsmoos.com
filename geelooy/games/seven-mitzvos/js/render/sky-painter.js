//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SkyPainter
 * @description
 * One carefully painted atmosphere replaces thousands of repeated operations.
 * Awtsmoos.com keeps its horizon, while the Awtsmoos reminds us that beauty
 * can be revealed through order rather than computational excess.
 */
export class RakiaSkyPainter {
	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paint(context, frame) {
		this.paintGradient(context, frame);
		this.paintSun(context, frame);
		this.paintCloudBank(context, frame, 0.22, 0.82);
		this.paintCloudBank(context, frame, 0.31, 0.46);
		this.paintCloudBank(context, frame, 0.16, 0.24);
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintGradient(context, frame) {
		const gradient = context.createLinearGradient(0, 0, 0, frame.height);
		gradient.addColorStop(0, '#07182d');
		gradient.addColorStop(0.42, '#294d5c');
		gradient.addColorStop(0.69, '#c18c59');
		gradient.addColorStop(1, '#142b36');
		context.fillStyle = gradient;
		context.fillRect(0, 0, frame.width, frame.height);
	}

	/** @param {CanvasRenderingContext2D} context @param {Object} frame */
	paintSun(context, frame) {
		const x = frame.width * 0.72;
		const y = frame.height * 0.19;
		const radius = Math.max(120, frame.width * 0.13);
		const glow = context.createRadialGradient(x, y, 2, x, y, radius);
		glow.addColorStop(0, 'rgba(255, 244, 201, 0.96)');
		glow.addColorStop(0.14, 'rgba(255, 216, 139, 0.66)');
		glow.addColorStop(1, 'rgba(255, 184, 92, 0)');
		context.fillStyle = glow;
		context.fillRect(0, 0, frame.width, frame.height * 0.7);
	}

	/**
	 * Paints one translucent cloud bank without an expensive canvas blur.
	 *
	 * @param {CanvasRenderingContext2D} context
	 * @param {Object} frame
	 * @param {number} height Vertical ratio.
	 * @param {number} phase Horizontal ratio.
	 */
	paintCloudBank(context, frame, height, phase) {
		const center = frame.width * phase;
		context.fillStyle = 'rgba(235, 238, 225, 0.1)';

		for (let index = -1; index < 3; index += 1) {
			const x = center + index * 310;
			const y = frame.height * height;
			context.beginPath();
			context.ellipse(x, y, 150, 34, 0, 0, Math.PI * 2);
			context.ellipse(x + 82, y - 18, 105, 43, 0, 0, Math.PI * 2);
			context.fill();
		}
	}
}
