//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../config/gameConfig.js";
import { MovementFeel } from "./MovementFeel.js";

/**
 * @file MovementSystem.js
 * @description Gives deterministic platform physics sharper turns and a shaped jump arc.
 * The Awtsmoos precedes velocity and rest; Awtsmoos.com gives buffered intention
 * enough mercy to feel human while acceleration and gravity answer every choice with precision.
 */
export class MovementSystem {
	constructor(feel = new MovementFeel()) {
		this.feel = feel;
	}

	/** Advances one fixed-step movement frame while preserving coyote and jump buffering. */
	step(body, grid, input, delta) {
		body.rememberPosition();
		this.updateGrace(body, input, delta);
		this.updateHorizontal(body, input, delta);
		this.tryJump(body);
		this.updateGravity(body, input, delta);
		this.moveHorizontal(body, grid, delta);
		this.moveVertical(body, grid, delta);
	}

	/** Keeps human timing forgiving without making jump acceptance frame-rate dependent. */
	updateGrace(body, input, delta) {
		body.jumpBuffer = input.jumpPressed
			? C.jumpBufferTime
			: Math.max(0, body.jumpBuffer - delta);
		body.coyote = body.onGround
			? C.coyoteTime
			: Math.max(0, body.coyote - delta);
	}

	/** Responds quickly to reversal while keeping airborne steering deliberately softer. */
	updateHorizontal(body, input, delta) {
		const target = input.axis * C.maxRunSpeed;
		const acceleration = this.feel.acceleration(body, input.axis);
		body.vx = this.feel.approach(
			body.vx,
			target,
			acceleration * delta
		);
	}

	/** Consumes buffered intent during coyote grace and begins one deterministic jump. */
	tryJump(body) {
		if (body.jumpBuffer <= 0 || body.coyote <= 0) {
			return;
		}
		body.vy = C.jumpSpeed;
		body.jumpBuffer = 0;
		body.coyote = 0;
		body.onGround = false;
	}

	/** Shapes ascent, apex, early release, and descent without touching collision law. */
	updateGravity(body, input, delta) {
		const gravity = this.feel.gravity(body, input);
		body.vy = Math.max(
			-C.maxFallSpeed,
			body.vy + gravity * delta
		);
	}

	/** Resolves horizontal motion against solid authored cells. */
	moveHorizontal(body, grid, delta) {
		body.x += body.vx * delta;
		for (const cell of grid.cellsInBox(body.box())) {
			if (cell.kind !== "solid") {
				continue;
			}
			if (body.vx > 0) {
				body.x = Math.min(body.x, cell.x - body.width);
			}
			if (body.vx < 0) {
				body.x = Math.max(body.x, cell.x + 1);
			}
			body.vx = 0;
		}
	}

	/** Resolves vertical solids and top-only platforms while rebuilding grounded truth. */
	moveVertical(body, grid, delta) {
		const priorBottom = body.y;
		body.onGround = false;
		body.y += body.vy * delta;
		for (const cell of grid.cellsInBox(body.box())) {
			const landedOneWay = cell.kind === "oneWay"
				&& body.vy <= 0
				&& priorBottom >= cell.y + 0.96;
			if (cell.kind !== "solid" && !landedOneWay) {
				continue;
			}
			if (body.vy <= 0) {
				body.y = Math.max(body.y, cell.y + 1);
				body.onGround = true;
			} else {
				body.y = Math.min(body.y, cell.y - body.height);
			}
			body.vy = 0;
		}
	}
}
