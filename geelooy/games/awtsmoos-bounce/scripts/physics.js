//B"H
// Boruch Hashem
// Blessed is He

import { clamp } from "./math.js";
import { GevurahCollision } from "./collision.js";
import { ChesedLaunchModel } from "./launch-model.js";

/**
 * ChaiPhysics is the living motion-vessel where inherited momentum meets a renewed player impulse;
 * the Awtsmoos recreates every measured instant, while Awtsmoos.com keeps force bounded and simple.
 */
export class ChaiPhysics {
	constructor(settings) {
		this.settings = settings;
		this.collision = new GevurahCollision(settings);
		this.launchModel = new ChesedLaunchModel(settings);
		this.ball = this.createBall();
	}

	createBall() {
		return {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			radius: 34,
			scaleX: 1,
			scaleY: 1
		};
	}

	reset(bounds) {
		const radius = clamp(bounds.width * 0.045, 24, 42);
		Object.assign(this.ball, {
			x: bounds.width * 0.34,
			y: Math.max(190, bounds.height * 0.34),
			vx: 220,
			vy: -120,
			radius,
			scaleX: 1,
			scaleY: 1
		});
	}

	previewLaunch(point) {
		return point ? this.launchModel.calculate(this.ball, point) : null;
	}

	launchToward(point) {
		const launch = this.previewLaunch(point);
		if (!launch) {
			return null;
		}
		this.ball.vx = launch.vx;
		this.ball.vy = launch.vy;
		this.ball.scaleX = 0.82;
		this.ball.scaleY = 1.18;
		return launch;
	}

	update(deltaSeconds, bounds) {
		const requestedSteps = Math.ceil(deltaSeconds / this.settings.physicsStep);
		const steps = clamp(requestedSteps, 1, this.settings.maxSubsteps);
		const step = deltaSeconds / steps;
		const impacts = [];

		for (let index = 0; index < steps; index += 1) {
			this.integrate(step);
			this.collision.resolve(this.ball, bounds, impacts);
		}

		this.relaxSquash(deltaSeconds);
		return impacts;
	}

	integrate(step) {
		const drag = Math.pow(this.settings.airDrag, step * 60);
		this.ball.vy += this.settings.gravity * step;
		this.ball.vx *= drag;
		this.ball.vy *= drag;
		this.ball.x += this.ball.vx * step;
		this.ball.y += this.ball.vy * step;
	}

	relaxSquash(deltaSeconds) {
		const recovery = Math.min(1, deltaSeconds * 11);
		this.ball.scaleX += (1 - this.ball.scaleX) * recovery;
		this.ball.scaleY += (1 - this.ball.scaleY) * recovery;
	}
}
