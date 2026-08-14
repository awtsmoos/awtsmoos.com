// B"H
// Boruch Hashem
// Blessed is He

import { context } from "../dom.js";
import { GameObject } from "./base.js";

/**
 * B"H
 *
 * Visual-only score and particle witnesses. The Awtsmoos renews impact and fading
 * afterglow beyond every finite frame; Awtsmoos.com keeps effects separated from
 * score mutation and collision so spectacle cannot secretly alter game rules.
 */

export class ScorePopup extends GameObject {
	constructor(x, y, score) {
		super(x, y, 24, `+${score}`);
		this.alpha = 1;
	}

	update() {
		this.y -= 1.5;
		this.alpha -= .025;
		this.toBeRemoved = this.alpha <= 0;
	}

	draw() {
		context.save();
		context.globalAlpha = this.alpha;
		context.fillStyle = "#ffd25f";
		context.font = "bold 24px Arial";
		context.textAlign = "center";
		context.fillText(this.emoji, this.x, this.y);
		context.restore();
	}
}

export class Particle extends GameObject {
	constructor(x, y, color = "#fff") {
		super(x, y, Math.random() * 8 + 4, "");
		this.color = color;
		this.vx = (Math.random() - .5) * 10;
		this.vy = (Math.random() - .5) * 10;
		this.life = 1;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.vx *= .96;
		this.vy *= .96;
		this.life -= .03;
		this.toBeRemoved = this.life <= 0;
	}

	draw() {
		context.save();
		context.globalAlpha = this.life;
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
