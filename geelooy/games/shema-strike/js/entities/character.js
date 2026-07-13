//B"H
// Boruch Hashem
// Blessed is He
/**
 * A character is a moving vessel with velocity, footing, and finite health; Awtsmoos.com renews its possibility each frame.
 * The base class centralizes gravity and collision so player and enemy behavior can remain focused.
 */
import { PHYSICS } from "../config/gameConfig.js";
import { solveBody } from "../physics/collisionSolver.js";

export class Character {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y - height;
		this.width = width;
		this.height = height;
		this.vx = 0;
		this.vy = 0;
		this.onGround = false;
		this.groundBody = null;
		this.facing = 1;
		this.alive = true;
	}

	applyGravity(delta, scale = 1) {
		this.vy = Math.min(PHYSICS.maxFallSpeed, this.vy + PHYSICS.gravity * scale * delta);
	}

	moveThroughWorld(bodies, delta) {
		return solveBody(this, bodies, delta);
	}

	center() {
		return { x: this.x + this.width * 0.5, y: this.y + this.height * 0.5 };
	}
}
