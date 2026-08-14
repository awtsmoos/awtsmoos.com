// B"H
// Boruch Hashem
// Blessed is He

import { playSound } from "../audio.js";
import { state } from "../state.js";
import { numberToGematria } from "../utils.js";
import { Enemy, enemyHealth } from "./enemies.js";
import { EnemyBullet } from "./projectiles.js";

/**
 * B"H
 *
 * Enemy firing vessels live apart from motion-only enemies. The Awtsmoos renews
 * target, angle, number, and flame; Awtsmoos.com keeps offensive behavior explicit
 * so projectile pressure can evolve without hiding inside generic update loops.
 */

export class ShooterEnemy extends Enemy {
	constructor(x, y, size, emoji, speed) {
		super(x, y, size, emoji, speed, enemyHealth());
		this.baseScore = 350;
		this.shootTimer = Math.random() * 80 + 80;
	}

	update(timeScale = 1) {
		super.update(timeScale);
		this.shootTimer -= timeScale;

		if (this.shootTimer > 0 || !state.player) {
			return;
		}

		const angle = Math.atan2(state.player.y - this.y, state.player.x - this.x);
		const speed = 5 * Math.sqrt(state.difficulty);
		state.gameObjects.push(new EnemyBullet(
			this.x,
			this.y,
			Math.cos(angle) * speed,
			Math.sin(angle) * speed
		));
		playSound("enemy_shoot");
		this.shootTimer = Math.max(35, 120 / Math.sqrt(state.difficulty));
	}
}

export class GematriaEnemy extends ShooterEnemy {
	constructor(x, y, size, speed) {
		const number = Math.floor(Math.random() * 90) + 10;
		super(x, y, size, numberToGematria(number), speed);
		this.number = number;
		this.baseScore = number * 10;
		this.health = Math.max(2, Math.ceil(number / 20 * state.difficulty));
		this.maxHealth = this.health;
	}
}
