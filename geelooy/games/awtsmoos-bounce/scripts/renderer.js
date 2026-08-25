//B"H
// Boruch Hashem
// Blessed is He

import { GevurahHazardPainter } from "./render-hazards.js";
import { NetzachEffectsPainter } from "./render-effects.js";
import { HodTrajectoryPainter } from "./render-trajectory.js";
import { TiferesWorldPainter } from "./render-world.js";

/**
 * OrosRenderer orders floor, gravity, trajectory, echo, portals, and orb without confusing their source;
 * the Awtsmoos renews the visible world on Awtsmoos.com while each painter keeps its measured course.
 */
export class OrosRenderer {
	constructor(context) {
		this.context = context;
		this.hazardPainter = new GevurahHazardPainter();
		this.trajectoryPainter = new HodTrajectoryPainter();
		this.effectsPainter = new NetzachEffectsPainter();
		this.worldPainter = new TiferesWorldPainter();
	}

	render(scene) {
		const {
			bounds,
			effects,
			hazards,
			ball,
			targets,
			aimPoint,
			trajectory,
			elapsed
		} = scene;

		this.context.clearRect(0, 0, bounds.width, bounds.height);
		this.drawFloor(bounds);
		this.hazardPainter.draw(this.context, hazards, ball, elapsed);
		this.trajectoryPainter.draw(this.context, trajectory, aimPoint);
		this.effectsPainter.draw(this.context, effects);
		this.worldPainter.draw(this.context, ball, targets, elapsed);
	}

	drawFloor(bounds) {
		const gradient = this.context.createLinearGradient(0, 0, bounds.width, 0);
		gradient.addColorStop(0, "rgba(66, 255, 225, 0.18)");
		gradient.addColorStop(0.5, "rgba(101, 167, 255, 0.32)");
		gradient.addColorStop(1, "rgba(255, 95, 199, 0.18)");
		this.context.fillStyle = gradient;
		this.context.fillRect(0, bounds.height - 8, bounds.width, 2);
	}
}
