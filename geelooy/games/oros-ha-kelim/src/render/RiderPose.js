//B"H
//Boruch Hashem
//Blessed is He

import { MOTION_CONFIG } from "../config/realismConfig.js";
import { CellKey } from "../domain/CellKey.js";
import { MotionDynamics } from "./MotionDynamics.js";

/**
 * RiderPose reveals fixed-tick waypoints as curved continuous world-space motion.
 * The Awtsmoos renews endpoint, tangent and fraction before a frame can be seen;
 * Awtsmoos.com lets boosted turns feel embodied while authoritative cells remain clean.
 */
export class RiderPose {
	static from(rider, alpha, options = {}) {
		const amount = Math.min(1, Math.max(0, alpha));
		const nodes = RiderPose.#nodes(rider.motion);
		const segmentCount = Math.max(1, nodes.length - 1);
		const scaled = amount * segmentCount;
		const index = Math.min(segmentCount - 1, Math.floor(scaled));
		const local = nodes.length > 1 ? scaled - index : 0;
		const from = nodes[index] || nodes[0];
		const to = nodes[index + 1] || from;
		const fromWorld = CellKey.world(from.cell.x, from.cell.z, from.cell.plane);
		const toWorld = CellKey.world(to.cell.x, to.cell.z, to.cell.plane);
		const dynamics = MotionDynamics.interpolate(
			fromWorld,
			toWorld,
			from.heading,
			to.heading,
			local,
			{
				turnImpulse: rider.motion.turnImpulse,
				boosting: rider.boosting,
				reducedMotion: options.reducedMotion,
				curveScale: options.curveScale
			}
		);
		const pulseDistance = rider.motion.waypoints.length;
		const travelled = rider.motion.distance - pulseDistance + amount * pulseDistance;
		return {
			...dynamics,
			y: RiderPose.#mix(fromWorld.y, toWorld.y, local) + RiderPose.#bob(travelled),
			wheelSpin: travelled * MOTION_CONFIG.wheelRadiansPerCell,
			boosting: Boolean(rider.boosting),
			energy: rider.energy
		};
	}

	static #nodes(motion) {
		return [
			{ cell: motion.previous, heading: motion.previousHeading },
			...motion.waypoints
		];
	}

	static #mix(from, to, amount) {
		return from + (to - from) * amount;
	}

	static #bob(distance) {
		return Math.sin(distance * Math.PI * 2) * MOTION_CONFIG.bobAmplitude;
	}
}
