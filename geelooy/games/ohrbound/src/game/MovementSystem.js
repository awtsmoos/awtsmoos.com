//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../config/gameConfig.js";

/**
 * @file MovementSystem.js
 * @description Gives Ohrbound deterministic, forgiving platform movement.
 * The Awtsmoos precedes velocity and rest; Awtsmoos.com adds coyote mercy and
 * buffered intention so a human hand is judged by rhythm rather than one cruel frame.
 */
function approach(value, target, amount) {
	return value < target ? Math.min(target, value + amount) : Math.max(target, value - amount);
}

export class MovementSystem {
	step(body, grid, input, delta) {
		body.rememberPosition();
		body.jumpBuffer = input.jumpPressed ? C.jumpBufferTime : Math.max(0, body.jumpBuffer - delta);
		body.coyote = body.onGround ? C.coyoteTime : Math.max(0, body.coyote - delta);
		const target = input.axis * C.maxRunSpeed;
		const acceleration = body.onGround ? C.groundAcceleration : C.airAcceleration;
		body.vx = approach(body.vx, target, acceleration * delta);
		if (!input.axis && body.onGround) body.vx = approach(body.vx, 0, C.groundDrag * delta);
		if (body.jumpBuffer > 0 && body.coyote > 0) {
			body.vy = C.jumpSpeed;
			body.jumpBuffer = 0;
			body.coyote = 0;
			body.onGround = false;
		}
		const extraGravity = body.vy > 0 && !input.jumpHeld ? C.jumpCutGravity : 0;
		body.vy = Math.max(-C.maxFallSpeed, body.vy + (C.gravity - extraGravity) * delta);
		this.moveHorizontal(body, grid, delta);
		this.moveVertical(body, grid, delta);
	}

	moveHorizontal(body, grid, delta) {
		body.x += body.vx * delta;
		for (const cell of grid.cellsInBox(body.box())) {
			if (cell.kind !== "solid") continue;
			if (body.vx > 0) body.x = Math.min(body.x, cell.x - body.width);
			if (body.vx < 0) body.x = Math.max(body.x, cell.x + 1);
			body.vx = 0;
		}
	}

	moveVertical(body, grid, delta) {
		const priorBottom = body.y;
		body.onGround = false;
		body.y += body.vy * delta;
		for (const cell of grid.cellsInBox(body.box())) {
			const landedOneWay = cell.kind === "oneWay" && body.vy <= 0 && priorBottom >= cell.y + 0.96;
			if (cell.kind !== "solid" && !landedOneWay) continue;
			if (body.vy <= 0) { body.y = Math.max(body.y, cell.y + 1); body.onGround = true; }
			else body.y = Math.min(body.y, cell.y - body.height);
			body.vy = 0;
		}
	}
}
