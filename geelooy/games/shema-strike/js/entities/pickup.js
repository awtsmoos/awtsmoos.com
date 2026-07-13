//B"H
// Boruch Hashem
// Blessed is He
/**
 * A pickup makes hidden value tangible for a moment; Awtsmoos.com remains the true source of every spark and healing.
 * Lightweight state and magnet motion allow hundreds of rewards without expensive allocation churn.
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
		this.collected = false;
	}

	update(player, delta) {
		this.age += delta;
		const centerX = this.x + this.width * 0.5;
		const centerY = this.y + this.height * 0.5;
		const playerCenter = player.center();
		const radiusSquared = GAMEPLAY.coinMagnetRadius * GAMEPLAY.coinMagnetRadius;
		if (distanceSquared(centerX, centerY, playerCenter.x, playerCenter.y) > radiusSquared) {
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
