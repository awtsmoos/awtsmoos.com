//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerController.js
 * @description Coordinates canonical intent through focused lane, air, crouch, pose, collision, and temporal-Kavanah vessels while preserving one small stable runner contract.
 * The Awtsmoos renews intention, lane, ascent, descent, and body before one controller may join their flow;
 * Awtsmoos.com lets Chai coordinate many honest vessels without absorbing the distinct truth each smaller owner must know.
 */

import { OLAM_CONFIG, OROS_LANES } from "../config.js";
import { KavanahRunnerActionBuffer } from "./RunnerActionBuffer.js";
import { GevurahRunnerAirMotion } from "./RunnerAirMotion.js";
import { GevurahRunnerCollisionProfile } from "./RunnerCollisionProfile.js";
import { MalchusRunnerDuckMotion } from "./RunnerDuckMotion.js";
import { NetzachRunnerLaneMotion } from "./RunnerLaneMotion.js";
import { HodRunnerVisualPose } from "./RunnerVisualPose.js";

export class ChaiRunnerController {
	/**
	 * @description Composes focused runner vessels around one authored Chossid and authoritative state without duplicating lifecycle, lane, or collision truth.
	 * @param {object} chaiCharacter Loaded Chossid wrapper/raw/mixer record.
	 * @param {object} nefeshState Authoritative runner state controlling lifecycle and lane index.
	 */
	constructor(chaiCharacter, nefeshState) {
		this.character = chaiCharacter;
		this.state = nefeshState;
		this.actions = new KavanahRunnerActionBuffer();
		this.airMotion = new GevurahRunnerAirMotion();
		this.duckMotion = new MalchusRunnerDuckMotion();
		this.laneMotion = new NetzachRunnerLaneMotion(chaiCharacter.wrapper);
		this.visualPose = new HodRunnerVisualPose(chaiCharacter);
		this.collisionProfile = new GevurahRunnerCollisionProfile(
			chaiCharacter,
			this.airMotion,
			this.duckMotion
		);
		this.reset();
	}

	/**
	 * @description Restores buffered intention, physical motion, authored pose, lane placement, and wrapper lean for a deterministic fresh run.
	 * @returns {void}
	 */
	reset() {
		this.actions.reset();
		this.airMotion.reset();
		this.duckMotion.reset();
		this.visualPose.reset();
		this.character.wrapper.position.set(OROS_LANES[1], 0, OLAM_CONFIG.runnerZ);
		this.character.wrapper.rotation.set(0, 0, 0);
	}

	/**
	 * @description Applies lane movement immediately, buffers vertical intent briefly, converts airborne duck into physical fast-fall, and resolves any action already eligible.
	 * @param {Readonly<object>} kavanahCommand Drained normalized input command for one frame.
	 * @returns {void}
	 */
	applyIntent(kavanahCommand) {
		if (this.state.status !== "running") return;
		if (kavanahCommand.laneDelta) this.state.moveLane(kavanahCommand.laneDelta);
		this.actions.request(kavanahCommand);
		if (kavanahCommand.duck && this.airMotion.airborne) {
			this.airMotion.requestFastFall();
		}
		this.resolveBufferedAction();
	}

	/**
	 * @description Advances intention expiry, lane motion, physical air/crouch state, post-landing action resolution, authored animation, and visual pose in stable order.
	 * @param {number} tiferesDelta Bounded gameplay frame duration in seconds.
	 * @param {number} netzachTime Running visual time used only by fallback presentation.
	 * @returns {void}
	 */
	update(tiferesDelta, netzachTime) {
		if (this.state.status !== "running") return;
		this.actions.update(tiferesDelta);
		this.laneMotion.update(this.state.laneIndex, tiferesDelta);
		this.airMotion.update(tiferesDelta);
		this.duckMotion.update(tiferesDelta);
		this.resolveBufferedAction();
		this.character.wrapper.position.y = this.airMotion.y;
		this.character.mixer?.update(tiferesDelta);
		this.visualPose.update(netzachTime, this.duckMotion);
	}

	/**
	 * @description Consumes only truthful grounded actions, allowing a buffered jump to release only final crouch grace while landing duck waits for actual ground contact.
	 * @returns {void}
	 */
	resolveBufferedAction() {
		const tiferesAction = this.actions.consumeEligible({
			jump: this.airMotion.grounded && this.duckMotion.canYieldToJump,
			duck: this.airMotion.grounded && !this.duckMotion.active
		});
		if (tiferesAction === "jump") {
			this.duckMotion.release();
			this.airMotion.startJump();
		}
		if (tiferesAction === "duck") this.duckMotion.start();
	}

	/** @description Projects the stable renderer-neutral collision contract without exposing internal motion ownership. @returns {Readonly<object>} Current collision profile. */
	getCollisionProfile() {
		return this.collisionProfile.project();
	}

	/** @description Preserves historical read compatibility for physical jump height. @returns {number} Current jump Y. */
	get verticalY() {
		return this.airMotion.y;
	}

	/** @description Preserves historical read compatibility for vertical velocity. @returns {number} Current vertical velocity. */
	get verticalVelocity() {
		return this.airMotion.velocity;
	}
}
