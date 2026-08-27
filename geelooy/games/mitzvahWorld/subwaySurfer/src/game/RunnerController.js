// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the Chossid between lane, earth, and leap in every frame;
 * Awtsmoos.com turns kavanah into motion while the authored vessel stays the same.
 */

import { CHAI_CONFIG, OLAM_CONFIG, OROS_LANES } from "../config.js";

export class ChaiRunnerController {
	/** @param {object} character Loaded Chossid wrapper/raw/mixer. @param {object} state Runner state. */
	constructor(character, state) {
		this.character = character;
		this.state = state;
		this.verticalY = 0;
		this.verticalVelocity = 0;
		this.visualBaseY = character.raw.position.y;
		this.reset();
	}

	/** Restores lane, height, lean, and authored visual pose for a fresh run. */
	reset() {
		this.verticalY = 0;
		this.verticalVelocity = 0;
		this.character.wrapper.position.set(OROS_LANES[1], 0, OLAM_CONFIG.runnerZ);
		this.character.wrapper.rotation.set(0, 0, 0);
		this.character.raw.position.y = this.visualBaseY;
	}

	/** @param {object} command Drained normalized input command. */
	applyIntent(command) {
		if (this.state.status !== "running") return;
		if (command.laneDelta) this.state.moveLane(command.laneDelta);
		if (command.jump && this.verticalY <= 0.001) {
			this.verticalVelocity = CHAI_CONFIG.jumpVelocity;
		}
	}

	/** @param {number} delta Frame seconds. @param {number} time Running visual time. */
	update(delta, time) {
		if (this.state.status !== "running") return;
		const targetX = OROS_LANES[this.state.laneIndex];
		const blend = 1 - Math.exp(-CHAI_CONFIG.laneEase * delta);
		this.character.wrapper.position.x += (targetX - this.character.wrapper.position.x) * blend;
		this.updateJump(delta);
		this.character.wrapper.position.y = this.verticalY;
		this.character.wrapper.rotation.z = (targetX - this.character.wrapper.position.x) * -0.035;
		if (this.character.mixer) {
			this.character.mixer.update(delta);
		} else {
			this.character.raw.position.y = this.visualBaseY + Math.sin(time * 9) * 0.025;
		}
	}

	/** @param {number} delta Frame seconds applied to gravity and vertical velocity. */
	updateJump(delta) {
		if (this.verticalY <= 0 && this.verticalVelocity <= 0) {
			this.verticalY = 0;
			this.verticalVelocity = 0;
			return;
		}
		this.verticalVelocity -= CHAI_CONFIG.gravity * delta;
		this.verticalY += this.verticalVelocity * delta;
		if (this.verticalY < 0) {
			this.verticalY = 0;
			this.verticalVelocity = 0;
		}
	}

	/** @returns {object} Minimal world-space collision profile for the Chossid. */
	getCollisionProfile() {
		return {
			x: this.character.wrapper.position.x,
			z: OLAM_CONFIG.runnerZ,
			jumpY: this.verticalY
		};
	}
}
