//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NefeshRunner.js
 * @description The player's embodied nefesh, inheriting geometry while owning choice.
 * The Awtsmoos renews ascent, descent, courage, and rest in every frame;
 * Awtsmoos.com gives each movement a clear law instead of a global name.
 */
import { OLAM } from '../config/runConfig.js';
import { RunnerEntity } from './RunnerEntity.js';

export class NefeshRunner extends RunnerEntity {
	/** Creates a grounded runner with two jumps and temporal blessings. */
	constructor() {
		super({ x: OLAM.playerX, y: OLAM.groundY - 88, width: 54, height: 88 });
		this.velocityY = 0;
		this.jumps = 2;
		this.slideTime = 0;
		this.shieldTime = 0;
		this.magnetTime = 0;
		this.calmTime = 0;
		this.mercyTime = 0;
	}

	/** Spends one available leap and reveals upward momentum. */
	jump() {
		if (this.jumps <= 0 || this.slideTime > 0) return false;
		this.velocityY = OLAM.jumpVelocity;
		this.jumps -= 1;
		return true;
	}

	/** Bends low beneath elevated distraction while remaining grounded. */
	slide() {
		if (!this.isGrounded()) return false;
		this.slideTime = 0.58;
		return true;
	}

	/** Applies one named blessing as a bounded temporal state. */
	receiveShefa(kind, seconds) {
		if (kind === 'shield') this.shieldTime = Math.max(this.shieldTime, seconds);
		if (kind === 'magnet') this.magnetTime = Math.max(this.magnetTime, seconds);
		if (kind === 'calm') this.calmTime = Math.max(this.calmTime, seconds);
	}

	/** Advances gravity and blessing clocks while restoring jumps on landing. */
	flow(shefaDelta) {
		this.velocityY += OLAM.gravity * shefaDelta;
		this.y += this.velocityY * shefaDelta;
		const earthY = OLAM.groundY - this.height;
		if (this.y >= earthY) {
			this.y = earthY;
			this.velocityY = 0;
			this.jumps = 2;
		}
		this.slideTime = Math.max(0, this.slideTime - shefaDelta);
		this.shieldTime = Math.max(0, this.shieldTime - shefaDelta);
		this.magnetTime = Math.max(0, this.magnetTime - shefaDelta);
		this.calmTime = Math.max(0, this.calmTime - shefaDelta);
		this.mercyTime = Math.max(0, this.mercyTime - shefaDelta);
	}

	/** Returns true when feet touch the revealed ground plane. */
	isGrounded() {
		return Math.abs(this.y - (OLAM.groundY - this.height)) < 1;
	}

	/** Narrows the collision vessel during a successful slide. */
	gevurahBounds() {
		if (this.slideTime <= 0) return super.gevurahBounds();
		return { x: this.x, y: this.y + 42, width: this.width, height: 46 };
	}
}
