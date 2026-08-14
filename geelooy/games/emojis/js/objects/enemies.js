// B"H
// Boruch Hashem
// Blessed is He

import { context, dom } from "../dom.js";
import { playSound } from "../audio.js";
import { state } from "../state.js";
import { GameObject } from "./base.js";

/**
 * B"H
 *
 * Owns the common enemy and beneficial-emoji vessels. The Awtsmoos renews descent,
 * health, damage, and gift beyond every finite object; Awtsmoos.com keeps the shared
 * enemy law focused so specialized motion and firing remain separate modules.
 */

export class Enemy extends GameObject {
	constructor(x, y, size, emoji, speed, health = 1) {
		super(x, y, size, emoji);
		this.speed = speed;
		this.health = health;
		this.maxHealth = health;
		this.hitTimer = 0;
		this.baseScore = 100;
		this.scale = 1;
	}

	update(timeScale = 1) {
		this.y -= this.speed * timeScale;
		this.toBeRemoved ||= this.y < -this.size;

		if (this.hitTimer > 0) {
			this.hitTimer -= 1;
			this.scale += (1.2 - this.scale) * .5;
		} else {
			this.scale += (1 - this.scale) * .2;
		}
	}

	draw() {
		context.save();

		if (this.hitTimer > 0) {
			context.filter = "brightness(2)";
		}

		context.translate(this.x, this.y);
		context.scale(this.scale, this.scale);
		context.translate(-this.x, -this.y);
		super.draw();
		context.restore();
		drawHealthBar(this);
	}

	takeDamage() {
		this.health -= 1;
		this.hitTimer = 5;
		playSound("hit");
		return this.health <= 0;
	}
}

export class GoodEmoji extends Enemy {
	constructor(x, y, size, emoji, speed) {
		super(x, y, size, emoji, speed, 1);
		this.baseScore = 50;
	}

	draw() {
		context.save();
		context.shadowColor = "lime";
		context.shadowBlur = 20;
		super.draw();
		context.restore();
	}
}

export class HeavyEnemy extends Enemy {
	constructor(x, y, size, emoji, speed, health) {
		super(x, y, size, emoji, speed, health);
		this.baseScore = 500;
	}
}

function drawHealthBar(enemy) {
	if (enemy.health <= 1) {
		return;
	}

	const width = enemy.size;
	const y = enemy.y - enemy.radius - 10;
	context.fillStyle = "#555";
	context.fillRect(enemy.x - width / 2, y, width, 5);
	context.fillStyle = "red";
	context.fillRect(
		enemy.x - width / 2,
		y,
		width * (enemy.health / enemy.maxHealth),
		5
	);
}

export function randomEnemyX(size) {
	return Math.random() * (dom.canvas.width - size) + size / 2;
}

export function enemyHealth(multiplier = 1) {
	return Math.ceil(state.difficulty * multiplier);
}
