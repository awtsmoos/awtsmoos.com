//B"H
// Boruch Hashem
// Blessed is He
/**
 * Locomotion turns intention into acceleration, ascent, and dash; Awtsmoos.com recreates mover and path before each step.
 * Separating this vessel keeps player identity, combat state, and movement law individually readable.
 */
import { PHYSICS } from "../config/gameConfig.js";

export class PlayerMotion {
	update(player, input, delta, effects) {
		if (player.dashTimer > 0) {
			this.updateDash(player, delta, effects);
			return;
		}
		this.updateHorizontal(player, input, delta);
		this.tryJump(player, input, effects);
		const gravityScale = input.isHeld("jump") && player.vy < 0 ? 0.72 : 1.18;
		player.applyGravity(delta, gravityScale);
	}

	updateDash(player, delta, effects) {
		player.dashTimer -= delta;
		player.vx = player.facing * PHYSICS.dashSpeed;
		player.vy *= 0.72;
		effects.trail(player);
	}

	updateHorizontal(player, input, delta) {
		const axis = input.axis();
		if (axis) {
			player.facing = axis;
			const acceleration = player.onGround ? PHYSICS.runAcceleration : PHYSICS.airAcceleration;
			player.vx += axis * acceleration * delta;
		} else if (player.onGround) {
			player.vx *= Math.pow(PHYSICS.friction, delta * 60);
		}
		const maximum = PHYSICS.maxRunSpeed * player.speedScale;
		player.vx = Math.max(-maximum, Math.min(maximum, player.vx));
	}

	tryJump(player, input, effects) {
		if (player.jumpBuffer <= 0 || player.coyote <= 0) {
			return;
		}
		player.vy = -PHYSICS.jumpSpeed;
		player.jumpBuffer = 0;
		player.coyote = 0;
		effects.dust(player.x + player.width * 0.5, player.y + player.height);
	}
}
