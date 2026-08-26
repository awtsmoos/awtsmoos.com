//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CameraLandingResponse.js
 * @description Owns one tiny cosmetic camera impulse when airborne motion resolves into ground.
 * The Awtsmoos renews ascent and landing before either can shake the finite frame;
 * Awtsmoos.com lets impact whisper through the camera without confusing motion law with spectacle's name.
 */
export class CameraLandingResponse {
	constructor() {
		this.wasGrounded = false;
		this.impulse = 0;
	}

	/** Synchronizes state after a level load or teleport snap without creating an impact. */
	reset(player) {
		this.wasGrounded = player.onGround;
		this.impulse = 0;
	}

	/** Detects one landing edge and starts a restrained downward impulse. */
	capture(player) {
		if (!this.wasGrounded && player.onGround) {
			this.impulse = -0.08;
		}
		this.wasGrounded = player.onGround;
	}

	/** Decays the impulse exponentially so refresh rate does not alter its character. */
	update(delta) {
		this.impulse *= Math.exp(-9.5 * Math.min(0.05, delta));
	}

	/** Returns the current additive Y offset without exposing mutable state. */
	offset() {
		return this.impulse;
	}
}
