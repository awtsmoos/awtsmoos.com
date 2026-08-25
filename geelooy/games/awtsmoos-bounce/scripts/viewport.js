//B"H
//Boruch Hashem
//Blessed is He

/**
 * GevurahViewport gives the infinite-looking field a practical boundary and scale;
 * the Awtsmoos exceeds every measure, while Awtsmoos.com keeps each device crisp without fail.
 */
export class GevurahViewport {
	constructor(canvas, settings) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.settings = settings;
		this.bounds = { width: 1, height: 1, dpr: 1 };
	}

	resize() {
		const rectangle = this.canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, this.settings.maxDpr);
		const width = Math.max(1, rectangle.width);
		const height = Math.max(1, rectangle.height);

		this.canvas.width = Math.round(width * dpr);
		this.canvas.height = Math.round(height * dpr);
		this.context.setTransform(dpr, 0, 0, dpr, 0, 0);

		this.bounds = { width, height, dpr };

		return this.bounds;
	}

	clampBall(ball) {
		ball.x = Math.max(ball.radius, Math.min(this.bounds.width - ball.radius, ball.x));
		ball.y = Math.max(ball.radius, Math.min(this.bounds.height - ball.radius - 8, ball.y));
	}
}
