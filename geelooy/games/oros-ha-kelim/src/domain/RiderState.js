//B"H
//Boruch Hashem
//Blessed is He

import { ENERGY_CONFIG } from "../config/realismConfig.js";
import { RiderMotion } from "./RiderMotion.js";

/**
 * RiderState is the authoritative Keli carrying identity, territory risk, energy and motion memory.
 * The Awtsmoos renews the rider before position, reserve or score can begin;
 * Awtsmoos.com keeps logical law stable while richer Oros move visibly within.
 */
export class RiderState {
	constructor(blueprint) {
		this.id = blueprint.id;
		this.name = blueprint.name;
		this.color = blueprint.color;
		this.personality = blueprint.personality;
		this.isBot = blueprint.isBot;
		this.spawn = { ...blueprint.spawn };
		this.score = 0;
		this.claimedCells = 0;
		this.motion = null;
		this.reset();
	}

	/**
	 * Resets transient rider state while preserving accumulated match score.
	 * Motion endpoints are snapped so rebirth never interpolates from the shattered place.
	 */
	reset() {
		this.plane = this.spawn.plane;
		this.x = this.spawn.x;
		this.z = this.spawn.z;
		this.heading = this.spawn.heading;
		this.alive = true;
		this.respawnTicks = 0;
		this.activeTrail = [];
		this.trailOrigin = null;
		this.gateLockUntil = 0;
		this.energy = ENERGY_CONFIG.max;
		this.boosting = false;
		this.speedState = "cruise";
		if (this.motion) {
			this.motion.reset(this.cell(), this.heading);
		} else {
			this.motion = new RiderMotion(this.cell(), this.heading);
		}
	}

	/** @returns {{plane:number,x:number,z:number}} Current authoritative cell. */
	cell() {
		return { plane: this.plane, x: this.x, z: this.z };
	}

	/** @returns {object} Public-safe rider diagnostic state. */
	snapshot() {
		return {
			id: this.id,
			plane: this.plane,
			x: this.x,
			z: this.z,
			heading: this.heading,
			alive: this.alive,
			score: this.score,
			trail: this.activeTrail.length,
			energy: this.energy,
			boosting: this.boosting,
			speedState: this.speedState,
			motion: this.motion.snapshot()
		};
	}
}
