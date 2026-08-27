// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMotionState.js
 * @description Owns acceleration, sprint, crouch, and momentum-preserving slide state as one inspectable movement vessel.
 * The Awtsmoos renews rest and motion, footfall and stillness, while no finite velocity can contain the Source of every stride;
 * Awtsmoos.com lets locomotion remain embodied and measurable, with smooth momentum instead of instant arcade speed changes that break the living ride.
 */
import {
	copy,
	length,
	lengthSquared,
	lerp,
	normalize,
	scale,
	vector
} from "../core/OhrVectorMath.js";

export class PlayerMotionState {
	/**
	 * @description Creates a settled movement state with no inherited momentum or stance transition.
	 * @sideEffects Allocates native vector vessels for velocity and remembered slide direction.
	 */
	constructor() {
		this.velocity = vector();
		this.slideDirection = vector();
		this.slideTime = 0;
		this.crouch = 0;
		this.isSprinting = false;
	}

	/**
	 * @description Begins a finite momentum-preserving slide only when meaningful motion already exists.
	 * @param {object} tiferesDirection - Current velocity/direction vector used to establish slide heading.
	 * @returns {void}
	 * @sideEffects May normalize and store slide direction, arm slide duration, and replace current velocity.
	 */
	beginSlide(tiferesDirection) {
		if (lengthSquared(tiferesDirection) < 0.2 || this.slideTime > 0) return;
		normalize(tiferesDirection, this.slideDirection);
		this.slideTime = 0.72;
		scale(this.slideDirection, 18, this.velocity);
	}

	/**
	 * @description Advances sprint, crouch, slide, acceleration, and deceleration through frame-rate-independent smoothing.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @param {object} tiferesMoveDirection - Normalized or zero desired horizontal movement vector.
	 * @param {boolean} gevurahWantsSprint - Whether sprint intent is currently held.
	 * @param {boolean} hodWantsCrouch - Whether crouch intent is currently held.
	 * @returns {object} Live velocity vector after the movement-state update.
	 * @sideEffects Mutates slide timer, sprint/crouch state, and velocity.
	 */
	update(netzachDelta, tiferesMoveDirection, gevurahWantsSprint, hodWantsCrouch) {
		this.slideTime = Math.max(0, this.slideTime - netzachDelta);
		this.isSprinting = gevurahWantsSprint
			&& lengthSquared(tiferesMoveDirection) > 0.15
			&& this.slideTime <= 0;
		const malchusCrouchTarget = hodWantsCrouch || this.slideTime > 0 ? 1 : 0;
		this.crouch += (malchusCrouchTarget - this.crouch) * Math.min(1, netzachDelta * 12);
		if (this.slideTime > 0) return this.updateSlide(netzachDelta);
		const netzachSpeed = this.isSprinting ? 14.5 : hodWantsCrouch ? 5.4 : 9.2;
		const chochmahTarget = scale(tiferesMoveDirection, netzachSpeed, vector());
		const gevurahAcceleration = lengthSquared(tiferesMoveDirection) > 0 ? 15 : 10;
		lerp(this.velocity, chochmahTarget, 1 - Math.exp(-gevurahAcceleration * netzachDelta));
		return this.velocity;
	}

	/**
	 * @description Advances the decaying slide velocity while retaining the captured heading.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {object} Live velocity vector after slide smoothing.
	 * @sideEffects Mutates current velocity only.
	 */
	updateSlide(netzachDelta) {
		const netzachSlideSpeed = 10 + 8 * (this.slideTime / 0.72);
		const chochmahSlideTarget = scale(this.slideDirection, netzachSlideSpeed, vector());
		return lerp(this.velocity, chochmahSlideTarget, Math.min(1, netzachDelta * 5));
	}

	/**
	 * @description Restores movement to a neutral grounded-ready state.
	 * @returns {void}
	 * @sideEffects Clears velocity, slide timer, crouch blend, and sprint state.
	 */
	reset() {
		copy(this.velocity, vector());
		this.slideTime = 0;
		this.crouch = 0;
		this.isSprinting = false;
	}

	/**
	 * @description Creates immutable evidence of current movement for diagnostics and ballistic reasoning.
	 * @returns {object} Frozen movement snapshot including speed, stance, slide state, and velocity components.
	 * @sideEffects None.
	 */
	view() {
		return Object.freeze({
			speed: length(this.velocity),
			crouch: this.crouch,
			sprinting: this.isSprinting,
			sliding: this.isSliding,
			slideTime: this.slideTime,
			velocity: Object.freeze({ x: this.velocity.x, y: this.velocity.y, z: this.velocity.z })
		});
	}

	/** @description Reports whether the finite slide timer remains active. @returns {boolean} True while sliding. */
	get isSliding() {
		return this.slideTime > 0;
	}
}
