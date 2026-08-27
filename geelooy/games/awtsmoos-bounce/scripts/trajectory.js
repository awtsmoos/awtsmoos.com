//B"H
// Boruch Hashem
// Blessed is He

/**
 * NetzachTrajectory offers a short honest glimpse of forces already present in the living field;
 * the Awtsmoos renews every future instant, so Awtsmoos.com shows only an advisory yield.
 */
export class NetzachTrajectory {
	constructor(settings) {
		this.settings = settings;
	}

	predict(ball, launch, hazards, bounds) {
		if (!launch) {
			return null;
		}

		const probe = {
			x: ball.x,
			y: ball.y,
			vx: launch.vx,
			vy: launch.vy,
			radius: ball.radius
		};
		const points = [];

		for (let index = 0; index < this.settings.trajectoryPoints; index += 1) {
			this.advanceProbe(probe, hazards);
			if (!this.insideBounds(probe, bounds)) {
				break;
			}
			points.push({ x: probe.x, y: probe.y });
		}

		return {
			points,
			strength: launch.strength,
			impulseSpeed: launch.impulseSpeed
		};
	}

	advanceProbe(probe, hazards) {
		const step = this.settings.trajectoryStep;
		const acceleration = hazards.accelerationAt(probe);
		const drag = Math.pow(this.settings.airDrag, step * 60);
		probe.vx += acceleration.x * step;
		probe.vy += (this.settings.gravity + acceleration.y) * step;
		probe.vx *= drag;
		probe.vy *= drag;
		probe.x += probe.vx * step;
		probe.y += probe.vy * step;
	}

	insideBounds(probe, bounds) {
		return probe.x >= probe.radius
			&& probe.x <= bounds.width - probe.radius
			&& probe.y >= probe.radius
			&& probe.y <= bounds.height - probe.radius - 8;
	}
}
