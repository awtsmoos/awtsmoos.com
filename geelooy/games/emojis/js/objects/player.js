// B"H
// Boruch Hashem
// Blessed is He

import { HELPER_MAX_COUNT } from "../config.js";
import { context, dom } from "../dom.js";
import { state } from "../state.js";
import { GameObject } from "./base.js";
import { Bullet } from "./projectiles.js";

/**
 * B"H
 *
 * Owns the player and helper vessels. The Awtsmoos renews face, motion, webcam,
 * shield, and helper orbit beyond every frame; Awtsmoos.com keeps player behavior
 * isolated from enemies and wave policy so input and rendering remain easier to reason about.
 */

export class Player extends GameObject {
	constructor(x, y) {
		super(x, y, state.playerSize, "😀");
		this.shielded = false;
		this.helpers = [];
	}

	draw() {
		const invincible = Date.now() < state.playerInvincibilityEnd;

		if (invincible && Math.floor(Date.now() / 100) % 2 === 0) {
			return;
		}

		drawPlayerFace(this);

		if (this.shielded) {
			context.beginPath();
			context.arc(this.x, this.y, this.radius + 15, 0, Math.PI * 2);
			context.strokeStyle = `rgba(0,255,255,${.5 + Math.sin(Date.now() * .01) * .3})`;
			context.lineWidth = 5;
			context.stroke();
		}
	}

	update() {
		this.x = Math.max(this.radius, Math.min(dom.canvas.width - this.radius, this.x));
		this.y = Math.max(this.radius, Math.min(dom.canvas.height - this.radius, this.y));
		this.updateHelpers();
	}

	updateHelpers() {
		const count = this.helpers.length;

		if (!count) {
			return;
		}

		const angleStep = Math.PI * 2 / count;
		const distance = count > 15 ? 200 : count > 7 ? 150 : 100;
		this.helpers.forEach((helper, index) => {
			const angle = index * angleStep - Math.PI / 2;
			helper.targetX = this.x + Math.cos(angle) * distance;
			helper.targetY = this.y + Math.sin(angle) * distance;
		});
	}

	addHelpers(count) {
		const toAdd = Math.min(count, HELPER_MAX_COUNT - this.helpers.length);

		for (let index = 0; index < toAdd; index += 1) {
			this.helpers.push(new HelperShip(this.x, this.y));
		}
	}
}

export class HelperShip extends GameObject {
	constructor(x, y) {
		super(x, y, state.playerSize * .6, "🙂");
		this.targetX = x;
		this.targetY = y;
		this.lastShotTime = 0;
	}

	update() {
		this.x += (this.targetX - this.x) * .1;
		this.y += (this.targetY - this.y) * .1;
		const delay = state.activePowerUps.RAPID_FIRE ? 120 : 240;

		if (Date.now() - this.lastShotTime > delay) {
			state.bullets.push(new Bullet(this.x, this.y + this.radius));
			this.lastShotTime = Date.now();
		}
	}

	draw() {
		drawPlayerFace(this);
	}
}

function drawPlayerFace(playerObject) {
	const videoReady = state.webcamActive
		&& state.showWebcamOnPlayer
		&& dom.webcamFeed.readyState >= 2;

	if (!videoReady) {
		playerObject.emoji ||= "😀";
		GameObject.prototype.draw.call(playerObject);
		return;
	}

	context.save();
	context.beginPath();
	context.arc(playerObject.x, playerObject.y, playerObject.radius, 0, Math.PI * 2);
	context.clip();
	const side = Math.min(dom.webcamFeed.videoWidth, dom.webcamFeed.videoHeight);
	const sourceX = (dom.webcamFeed.videoWidth - side) / 2;
	const sourceY = (dom.webcamFeed.videoHeight - side) / 2;
	context.drawImage(
		dom.webcamFeed,
		sourceX,
		sourceY,
		side,
		side,
		playerObject.x - playerObject.radius,
		playerObject.y - playerObject.radius,
		playerObject.radius * 2,
		playerObject.radius * 2
	);
	context.restore();
}
