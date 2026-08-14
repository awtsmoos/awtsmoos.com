// B"H
// Boruch Hashem
// Blessed is He

import { state } from "../state.js";
import { Enemy, enemyHealth } from "./enemies.js";

/**
 * B"H
 *
 * Specialized enemy motion vessels. The Awtsmoos renews wave, angle, dash, and
 * pursuit beyond every finite path; Awtsmoos.com keeps movement patterns isolated
 * from shooting and scoring so difficulty can evolve without a tangled enemy class.
 */

export class SineEnemy extends Enemy {
	constructor(x, y, size, emoji, speed) {
		super(x, y, size, emoji, speed, enemyHealth());
		this.startX = x;
		this.angle = 0;
		this.baseScore = 200;
	}

	update(timeScale = 1) {
		super.update(timeScale);
		this.angle += .04 * timeScale;
		this.x = this.startX + Math.sin(this.angle) * 100;
	}
}

export class DasherEnemy extends Enemy {
	constructor(x, y, size, emoji, speed) {
		super(x, y, size, emoji, speed, enemyHealth());
		this.baseScore = 300;
		this.dashCooldown = 80;
		this.dashTimer = Math.random() * 60 + 60;
	}

	update(timeScale = 1) {
		super.update(timeScale);
		this.dashTimer -= timeScale;

		if (this.dashTimer > 0 || !state.player) {
			return;
		}

		const direction = Math.sign(state.player.x - this.x);
		this.x += direction * 100 * timeScale;
		this.dashTimer = this.dashCooldown;
	}
}
