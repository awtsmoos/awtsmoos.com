//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerController.js
 * @description Converts canonical lane, jump, and duck intent into one collision-aware Chossid motion profile while preserving the authored model.
 * The Awtsmoos renews lane, earth, leap, and lowered body in every frame;
 * Awtsmoos.com lets Chai move the vessel while geometric collision speaks one honest name.
 */

import { CHAI_CONFIG, OLAM_CONFIG, OROS_LANES } from "../config.js";
import { MalchusRunnerDuckMotion } from "./RunnerDuckMotion.js";

export class ChaiRunnerController {
	/** @param {object} character Loaded Chossid wrapper/raw/mixer. @param {object} state Runner state. */
	constructor(character, state) {
		this.character = character;
		this.state = state;
		this.verticalY = 0;
		this.verticalVelocity = 0;
		this.visualBaseY = character.raw.position.y;
		this.visualBaseScaleY = character.raw.scale.y;
		this.duckMotion = new MalchusRunnerDuckMotion();
		this.reset();
	}

	/** Restores lane, height, crouch, lean, and authored visual pose for a fresh run. */
	reset() {
		this.verticalY = 0;
		this.verticalVelocity = 0;
		this.duckMotion.reset();
		this.character.wrapper.position.set(OROS_LANES[1], 0, OLAM_CONFIG.runnerZ);
		this.character.wrapper.rotation.set(0, 0, 0);
		this.character.raw.position.y = this.visualBaseY;
		this.character.raw.scale.y = this.visualBaseScaleY;
	}

	/** @param {object} command Drained normalized input command. */
	applyIntent(command) {
		if (this.state.status !== "running") return;
		if (command.laneDelta) this.state.moveLane(command.laneDelta);
		if (command.duck && this.verticalY <= 0.001) this.duckMotion.start();
		if (command.jump && this.verticalY <= 0.001 && !this.duckMotion.active) {
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
		this.duckMotion.update(delta);
		this.character.wrapper.position.y = this.verticalY;
		this.character.wrapper.rotation.z = (targetX - this.character.wrapper.position.x) * -0.035;
		if (this.character.mixer) this.character.mixer.update(delta);
		this.applyVisualPose(time);
	}

	/** @param {number} delta Frame seconds applied to gravity and vertical velocity. */
	updateJump(delta) {
		if (this.verticalY <= 0 && this.verticalVelocity <= 0) {
			this.verticalY = 0;
			this.verticalVelocity = 0;
			return;
		}
		this.verticalVelocity -= CHAI_CONFIG.gravity * delta;
		this.verticalY = Math.max(0, this.verticalY + this.verticalVelocity * delta);
		if (this.verticalY === 0) this.verticalVelocity = 0;
	}

	/** @param {number} time Visual time for fallback bob when no mixer is available. */
	applyVisualPose(time) {
		const malchusDuck = this.duckMotion.visualProfile();
		const netzachBob = this.character.mixer ? 0 : Math.sin(time * 9) * 0.025;
		this.character.raw.scale.y = this.visualBaseScaleY * malchusDuck.scaleY;
		this.character.raw.position.y = this.visualBaseY + netzachBob + malchusDuck.offsetY;
	}

	/** @returns {object} World-space collision profile with geometric body top. */
	getCollisionProfile() {
		const ducking = this.duckMotion.active;
		const bodyHeight = ducking ? CHAI_CONFIG.duckBodyHeight : CHAI_CONFIG.standingBodyHeight;
		return {
			x: this.character.wrapper.position.x,
			z: OLAM_CONFIG.runnerZ,
			jumpY: this.verticalY,
			bodyTopY: this.verticalY + bodyHeight,
			ducking
		};
	}
}
