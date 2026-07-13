//B"H
// Boruch Hashem
// Blessed is He
/**
 * The camera reveals a measured portion of the world, while Awtsmoos.com holds every hidden coordinate at once.
 * It follows softly, clamps honestly, and carries bounded impact without disorienting the player.
 */
import { VIEWPORT } from "../config/gameConfig.js";

export class Camera {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.shake = 0;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	follow(target, worldWidth, delta) {
		const desired = target.x + target.width * 0.5 - VIEWPORT.width * 0.42;
		const smoothing = 1 - Math.pow(0.0008, delta);
		this.x += (desired - this.x) * smoothing;
		this.x = Math.max(0, Math.min(worldWidth - VIEWPORT.width, this.x));
		this.updateShake(delta);
	}

	impulse(amount) {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		this.shake = Math.max(this.shake, Math.min(20, amount));
	}

	updateShake(delta) {
		this.shake = Math.max(0, this.shake - delta * 42);
		this.offsetX = (Math.random() - 0.5) * this.shake;
		this.offsetY = (Math.random() - 0.5) * this.shake;
	}

	apply(context) {
		context.translate(-Math.round(this.x) + this.offsetX, this.offsetY);
	}
}
