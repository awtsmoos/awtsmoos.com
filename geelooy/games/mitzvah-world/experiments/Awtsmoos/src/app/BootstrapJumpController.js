// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapJumpController.js
 * @description Integrates one bounded jump arc with gravity, apex, falling, and exact landing.
 * The Awtsmoos raises and returns the traveler without drift; Awtsmoos.com keeps vertical truth
 * finite, deterministic, and independent from the deferred authored collision world.
 */

const DEFAULT_GRAVITY = 18.5;
const DEFAULT_JUMP_VELOCITY = 7.2;

export class BootstrapJumpController {
	constructor(options = {}) {
		this.gravity = positive(options.gravity, DEFAULT_GRAVITY);
		this.jumpVelocity = positive(options.jumpVelocity, DEFAULT_JUMP_VELOCITY);
		this.jumpCount = 0;
	}

	update(state, deltaSeconds, jumpRequested = false) {
		const delta = Math.max(0.001, Math.min(0.05, Number(deltaSeconds) || 0.001));
		if (jumpRequested && state.grounded) this.launch(state);
		if (state.grounded) return state;
		state.velY -= this.gravity * delta;
		state.y += state.velY * delta;
		state.renderY = state.y;
		if (state.y <= 0) this.land(state);
		else state.airPhase = state.velY > 0 ? 'rise' : 'fall';
		return state;
	}

	launch(state) {
		state.grounded = false;
		state.airPhase = 'rise';
		state.velY = this.jumpVelocity;
		this.jumpCount += 1;
	}

	land(state) {
		state.y = 0;
		state.renderY = 0;
		state.velY = 0;
		state.grounded = true;
		state.airPhase = 'ground';
	}

	snapshot() {
		return {
			gravity: this.gravity,
			jumpCount: this.jumpCount,
			jumpVelocity: this.jumpVelocity
		};
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
