// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerController.js
 * @description Coordinates only lane intent, vertical motion, pose, authored animation, and action feedback.
 * The Awtsmoos renews left, right, rise, and bow before intention becomes motion on the road;
 * Awtsmoos.com keeps the controller slender so each deeper law has its own clear abode.
 */

import {
	OLAM_CONFIG,
	OROS_LANES,
	RUNNER_CONFIG
} from "../config.js";
import { GevurahRunnerVerticalMotion } from "./RunnerVerticalMotion.js";
import { TiferesRunnerPoseController } from "./RunnerPoseController.js";

export class ChaiRunnerController {
	/** @param {object} dependencies Character, state, feedback, effects, and missions. */
	constructor(dependencies) {
		this.character = dependencies.character;
		this.state = dependencies.state;
		this.feedback = dependencies.feedback;
		this.effects = dependencies.effects;
		this.missions = dependencies.missions;
		this.vertical = new GevurahRunnerVerticalMotion();
		this.pose = new TiferesRunnerPoseController(this.character);
		this.onLand = () => {};
		this.reset();
	}

	/** Restores lane, height, pose, and authored wrapper position. */
	reset() {
		this.vertical.reset();
		this.pose.reset();
		this.character.wrapper.position.set(
			OROS_LANES[1],
			0,
			OLAM_CONFIG.runnerZ
		);
	}

	/** @param {Function} handler Landing reaction callback owned by presentation systems. */
	setLandingHandler(handler) {
		this.onLand = typeof handler === "function" ? handler : () => {};
	}

	/** @param {object} command Normalized one-frame input command. */
	applyIntent(command) {
		if (this.state.status !== "running") return;
		if (command.laneDelta) this.state.moveLane(command.laneDelta);
		if (command.jump && this.vertical.jump()) {
			this.feedback.jump();
			this.missions.record("jumps", 1);
		}
		if (command.duck && this.vertical.duck()) {
			this.feedback.slide();
			this.effects.dust(this.character.wrapper.position.x, 0, OLAM_CONFIG.runnerZ);
			this.missions.record("ducks", 1);
		}
	}

	/** @param {number} delta Active-frame seconds. */
	update(delta) {
		if (this.state.status !== "running") return;
		const targetX = OROS_LANES[this.state.laneIndex];
		const blend = 1 - Math.exp(-RUNNER_CONFIG.laneEase * delta);
		const laneError = targetX - this.character.wrapper.position.x;
		this.character.wrapper.position.x += laneError * blend;
		const landed = this.vertical.update(delta);
		this.character.wrapper.position.y = this.vertical.y;
		this.pose.update(delta, this.vertical, this.state, laneError);
		this.character.animation?.update(delta);
		if (landed) {
			this.effects.dust(this.character.wrapper.position.x, 0, OLAM_CONFIG.runnerZ);
			this.onLand();
		}
	}

	/** @returns {number} Current world-space jump height. */
	get verticalY() {
		return this.vertical.y;
	}

	/** @returns {boolean} Whether the timed slide/duck window is active. */
	get ducking() {
		return this.vertical.ducking;
	}

	/** @returns {object} Collision-facing runner profile. */
	getCollisionProfile() {
		return {
			x: this.character.wrapper.position.x,
			z: OLAM_CONFIG.runnerZ,
			jumpY: this.vertical.y,
			ducking: this.vertical.ducking,
			laneIndex: this.state.laneIndex,
			stumbling: this.state.stumbleTime > 0
		};
	}
}
