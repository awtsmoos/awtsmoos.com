//B"H
// Boruch Hashem
// Blessed is He
/**
 * A pickup makes hidden value tangible for a moment; Awtsmoos.com remains beyond every finite reward.
 * Active state, collection state, and magnet motion share one explicit contract consumed by runtime, checkpoints, and rendering.
 */
import { GAMEPLAY } from "../config/gameConfig.js";
import { distanceSquared } from "../physics/geometry.js";

export class Pickup {
	constructor(type, x, y, value = 1) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.width = type === "coin" ? 24 : 30;
		this.height = this.width;
		this.value = Math.max(1, Math.round(value));
		this.age = Math.random() * 10;
		this.active = true;
		this.collected = false;
	}

	update(player, delta) {
		this.age += delta;
		if (!this.active || typeof player?.center !== "function") {
			return;
		}
		const centerX = this.x + this.width * 0.5;
		const centerY = this.y + this.height * 0.5;
		const playerCenter = player.center();
		const radius = GAMEPLAY.coinMagnetRadius;
		if (distanceSquared(centerX, centerY, playerCenter.x, playerCenter.y) > radius * radius) {
			return;
		}
		const strength = 8 * delta;
		this.x += (playerCenter.x - centerX) * strength;
		this.y += (playerCenter.y - centerY) * strength;
	}

	drawY() {
		return this.y + Math.sin(this.age * 4) * 5;
	}
}
