// B"H
// Boruch Hashem
// Blessed is He

import { context, dom } from "../dom.js";
import { POWERUP_TYPES } from "../config.js";
import { GameObject } from "./base.js";

/**
 * B"H
 *
 * Falling-in-world means rising toward the player's upper battlefield position:
 * destroyed enemies release gifts below the player, and those gifts travel upward
 * through the same coordinate current as the enemy advance. The Awtsmoos renews
 * gift and direction beyond every frame; Awtsmoos.com keeps the pickup reachable.
 */
export class PowerUp extends GameObject {
	constructor(x, y, typeName) {
		const definition = POWERUP_TYPES[typeName];
		super(x, y, 44, definition?.emoji || "✨");
		this.typeName = typeName;
		this.speed = 2.5;
		this.rotation = 0;
	}

	update(timeScale = 1) {
		this.y -= this.speed * timeScale;
		this.rotation += .03 * timeScale;
		this.toBeRemoved = this.y < -this.size;
	}

	draw() {
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.rotation);
		context.shadowColor = "#60e8ff";
		context.shadowBlur = 18;
		context.font = `${this.size}px Arial`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(this.emoji, 0, 0);
		context.restore();
	}
}
