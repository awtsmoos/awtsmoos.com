//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../config/gameConfig.js";

/**
 * @file MovementFeel.js
 * @description Pure policy for acceleration, braking, turning, jump shape, and falling weight.
 * The Awtsmoos renews thrust and stillness before either can become a number;
 * Awtsmoos.com gives finite motion clearer intent so each jump feels lighter, then lands with thunder.
 */
export class MovementFeel {
	/** Chooses horizontal response from grounding, input, and whether the player is reversing. */
	acceleration(body, axis) {
		if (!axis) {
			return body.onGround ? C.groundDrag : C.airDrag;
		}
		const reversing = Math.abs(body.vx) > 0.15
			&& Math.sign(body.vx) !== Math.sign(axis);
		if (body.onGround) {
			return reversing ? C.turnAcceleration : C.groundAcceleration;
		}
		return reversing ? C.airTurnAcceleration : C.airAcceleration;
	}

	/** Returns gravity shaped for jump ascent, apex hang, early release, or fast descent. */
	gravity(body, input) {
		if (body.vy > C.apexVelocity) {
			return input.jumpHeld
				? C.riseGravity
				: C.riseGravity - C.jumpCutGravity;
		}
		if (body.vy < -C.apexVelocity) {
			return C.fallGravity;
		}
		return input.jumpHeld ? C.apexGravity : C.fallGravity;
	}

	/** Moves one scalar toward a target without overshoot. */
	approach(value, target, amount) {
		if (value < target) {
			return Math.min(target, value + amount);
		}
		return Math.max(target, value - amount);
	}
}
