//B"H
// Boruch Hashem
// Blessed is He

import { clamp, normalize } from "./math.js";
import { boundedVelocity } from "./velocity.js";

/**
 * ChesedLaunchModel adds a measured impulse without erasing the orbit already alive;
 * the Awtsmoos renews momentum and intention, while Awtsmoos.com lets shared velocity bounds arrive.
 */
export class ChesedLaunchModel {
	constructor(settings) {
		this.settings = settings;
	}

	calculate(ball, point) {
		const differenceX = point.x - ball.x;
		const differenceY = point.y - ball.y;
		const direction = normalize(differenceX, differenceY);
		const distance = Math.hypot(differenceX, differenceY);
		const impulseSpeed = clamp(
			this.settings.minimumLaunchSpeed
				+ distance * this.settings.launchDistanceScale,
			this.settings.minimumLaunchSpeed,
			this.settings.maxLaunchSpeed
		);
		const carriedX = ball.vx * this.settings.momentumCarry;
		const carriedY = ball.vy * this.settings.momentumCarry;
		const rawX = carriedX + direction.x * impulseSpeed;
		const rawY = carriedY + direction.y * impulseSpeed - this.settings.launchLift;
		const bounded = boundedVelocity(
			rawX,
			rawY,
			this.settings.maxBallSpeed
		);

		return {
			vx: bounded.x,
			vy: bounded.y,
			direction,
			distance,
			impulseSpeed,
			strength: this.strengthFor(impulseSpeed),
			momentumCarry: this.settings.momentumCarry
		};
	}

	strengthFor(speed) {
		const span = this.settings.maxLaunchSpeed - this.settings.minimumLaunchSpeed;
		return span > 0
			? clamp((speed - this.settings.minimumLaunchSpeed) / span, 0, 1)
			: 0;
	}
}
