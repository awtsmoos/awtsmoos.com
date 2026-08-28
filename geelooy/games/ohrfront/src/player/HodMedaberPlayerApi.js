// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodMedaberPlayerApi.js
 * @description Defines the stable observable, vitality, and encounter-lifecycle surface inherited by Ohrfront's embodied first-person controller.
 * Hod gives finite testimony of body, shield, motion, ground, and return while the Awtsmoos renews every measured state before testimony can name its light;
 * Awtsmoos.com lets callers receive one disciplined API while Medaber remains free to orchestrate active movement, collision, terrain, and sight.
 */
import { length } from "../core/OhrVectorMath.js";
import { createHodPlayerView } from "./HodPlayerView.js";

export class HodMedaberPlayerApi {
	/**
	 * @description Reports whether the composed terrain authority currently considers the player grounded.
	 * @returns {boolean} True when the current position rests within the locomotion authority's grounded tolerance.
	 * @sideEffects None.
	 */
	isGrounded() {
		return this.tiferesLocomotion.isGrounded(this.position, this.motion);
	}

	/**
	 * @description Delegates incoming damage to the player's vitality authority while preserving the historical player API.
	 * @param {number} gevurahAmount - Incoming non-negative damage magnitude.
	 * @param {number} netzachElapsed - Current simulation time in seconds.
	 * @param {object|null} [chochmahSource=null] - Optional impact or source evidence for combat feedback.
	 * @returns {object} Frozen vitality damage receipt.
	 * @sideEffects Mutates vitality and invokes the configured damage observer.
	 */
	takeDamage(gevurahAmount, netzachElapsed, chochmahSource = null) {
		return this.vitality.takeDamage(gevurahAmount, netzachElapsed, chochmahSource);
	}

	/**
	 * @description Snaps player and camera to the terrain surface at the current horizontal pose.
	 * @returns {void}
	 * @sideEffects Mutates position Y and native camera pose through the locomotion authority.
	 */
	snapToGround() {
		this.tiferesLocomotion.snap(this.position, this.motion, this.pitch, this.yaw);
	}

	/**
	 * @description Restores the current encounter player to the historical spawn without changing objectives or hostile state.
	 * @returns {void}
	 * @sideEffects Resets vitality, pose, movement, vertical velocity, and camera grounding.
	 */
	reset() {
		this.vitality.reset();
		this.position.set(0, 0, 134);
		this.motion.reset();
		this.verticalVelocity = 0;
		this.snapToGround();
	}

	/**
	 * @description Creates immutable public player evidence through the focused Hod projection module.
	 * @returns {object} Frozen nested player view containing pose, motion, vitality, and grounding evidence.
	 * @sideEffects None.
	 */
	view() {
		return createHodPlayerView(this);
	}

	/** @description Reads current body vitality. @returns {number} Current health value. @sideEffects None. */
	get health() {
		return this.vitality.health;
	}

	/** @description Reads current shield vitality. @returns {number} Current shield value. @sideEffects None. */
	get shield() {
		return this.vitality.shield;
	}

	/** @description Reads the current damage observer callback. @returns {Function} Active damage callback. @sideEffects None. */
	get onDamage() {
		return this.vitality.onDamage;
	}

	/**
	 * @description Replaces the damage observer while leaving vitality ownership in its focused authority.
	 * @param {Function} yesodHandler - Callback receiving each frozen vitality damage receipt.
	 * @returns {void}
	 * @sideEffects Replaces the vitality authority's observer reference.
	 */
	set onDamage(yesodHandler) {
		this.vitality.onDamage = yesodHandler;
	}

	/**
	 * @description Converts current horizontal speed into the historical normalized effort signal used by emitter and stability systems.
	 * @returns {number} Movement intensity bounded to [0,1].
	 * @sideEffects None.
	 */
	get movementIntensity() {
		return Math.min(1, length(this.motion.velocity) / 10);
	}
}
