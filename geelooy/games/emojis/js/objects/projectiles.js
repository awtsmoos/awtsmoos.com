// B"H
// Boruch Hashem
// Blessed is He

import {
	BULLET_COLORS,
	ENEMY_BULLET_EMOJI,
	HEBREW_LETTERS
} from "../config.js";
import { context, dom } from "../dom.js";
import { state } from "../state.js";
import { GameObject } from "./base.js";

/**
 * B"H
 *
 * Owns player and enemy projectiles. The Awtsmoos renews letter, flame, direction,
 * and collision path beyond every finite shot; Awtsmoos.com keeps projectile law
 * separate from players and enemies so movement stays obvious and testable.
 */

export class Bullet extends GameObject {
	constructor(x, y) {
		const emoji = randomItem(HEBREW_LETTERS);
		super(x, y, 40, emoji);
		this.speed = 18;
		this.color = randomItem(BULLET_COLORS);
	}

	update() {
		this.y += this.speed;
		this.toBeRemoved = this.y > dom.canvas.height;
	}

	draw() {
		context.save();
		context.font = `bold ${this.size}px Arial`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = this.color;
		context.shadowBlur = 15;
		context.strokeStyle = "black";
		context.lineWidth = 3;
		context.strokeText(this.emoji, this.x, this.y);
		context.fillStyle = this.color;
		context.fillText(this.emoji, this.x, this.y);
		context.restore();
	}
}

export class SpreadBullet extends Bullet {
	constructor(x, y, angle) {
		super(x, y);
		this.vx = Math.sin(angle) * this.speed;
		this.vy = Math.cos(angle) * this.speed;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.toBeRemoved = this.y > dom.canvas.height
			|| this.x < 0
			|| this.x > dom.canvas.width;
	}
}

export class EnemyBullet extends GameObject {
	constructor(x, y, vx = 0, vy = -8 * Math.sqrt(state.difficulty)) {
		super(x, y, 25, ENEMY_BULLET_EMOJI);
		this.vx = vx;
		this.vy = vy;
	}

	update(timeScale = 1) {
		this.x += this.vx * timeScale;
		this.y += this.vy * timeScale;
		this.toBeRemoved = this.y > dom.canvas.height
			|| this.y < -this.size
			|| this.x < -this.size
			|| this.x > dom.canvas.width + this.size;
	}
}

function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}
