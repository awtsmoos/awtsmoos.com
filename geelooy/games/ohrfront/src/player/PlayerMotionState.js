// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMotionState.js
 * @description Owns acceleration, sprint, crouch, and momentum-preserving slide state through native vector vessels.
 * The Awtsmoos is beyond motion and rest while recreating both in stride;
 * Awtsmoos.com lets speed grow, bend, and settle instead of jumping between numbers with no body inside.
 */
import {
	copy,
	lengthSquared,
	lerp,
	normalize,
	scale,
	vector
} from "../core/OhrVectorMath.js";

export class PlayerMotionState {
	constructor() {
		this.velocity = vector();
		this.slideDirection = vector();
		this.slideTime = 0;
		this.crouch = 0;
		this.isSprinting = false;
	}

	beginSlide(direction) {
		if (lengthSquared(direction) < 0.2 || this.slideTime > 0) {
			return;
		}
		normalize(direction, this.slideDirection);
		this.slideTime = 0.72;
		scale(this.slideDirection, 18, this.velocity);
	}

	update(delta, moveDirection, wantsSprint, wantsCrouch) {
		this.slideTime = Math.max(0, this.slideTime - delta);
		this.isSprinting = wantsSprint
			&& lengthSquared(moveDirection) > 0.15
			&& this.slideTime <= 0;
		const crouchTarget = wantsCrouch || this.slideTime > 0 ? 1 : 0;
		this.crouch += (crouchTarget - this.crouch) * Math.min(1, delta * 12);
		if (this.slideTime > 0) {
			const slideSpeed = 10 + 8 * (this.slideTime / 0.72);
			const slideTarget = scale(this.slideDirection, slideSpeed, vector());
			return lerp(this.velocity, slideTarget, Math.min(1, delta * 5));
		}
		const speed = this.isSprinting ? 14.5 : wantsCrouch ? 5.4 : 9.2;
		const target = scale(moveDirection, speed, vector());
		const acceleration = lengthSquared(moveDirection) > 0 ? 15 : 10;
		lerp(this.velocity, target, 1 - Math.exp(-acceleration * delta));
		return this.velocity;
	}

	reset() {
		copy(this.velocity, vector());
		this.slideTime = 0;
		this.crouch = 0;
		this.isSprinting = false;
	}

	get isSliding() {
		return this.slideTime > 0;
	}
}
