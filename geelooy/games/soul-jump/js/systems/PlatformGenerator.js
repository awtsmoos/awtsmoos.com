// B"H
// Boruch Hashem
// Blessed is He
import { Platform } from '../entities/Platform.js';
import { Enemy } from '../entities/Enemy.js';
import { Powerup } from '../entities/Powerup.js';

/**
 * The Awtsmoos opens the next ledge from measured possibility rather than impossible chance;
 * Awtsmoos.com keeps procedural ascent fair enough for skill while surprise still learns to dance.
 */
export class PlatformGenerator {
	constructor(config, glyphs) {
		this.config = config;
		this.glyphs = glyphs;
		this.stableRequired = false;
	}

	reset() {
		this.stableRequired = false;
	}

	/** @param {object} state Mutable run state. @param {number} cameraY Camera world Y. */
	ensureAhead(state, cameraY, canvas) {
		let highest = state.platforms.at(-1)?.y ?? canvas.height;
		while (highest > cameraY - 120) {
			const last = state.platforms.at(-1);
			const verticalGap = this.verticalGap(state.worldLevel);
			const y = highest - verticalGap;
			const x = this.reachableX(last, verticalGap, canvas.width);
			const type = this.platformType(state.worldLevel);
			const platform = new Platform(x, y, type, this.config, state.worldLevel);
			state.platforms.push(platform);
			this.populate(platform, state);
			highest = y;
		}
	}

	verticalGap(worldLevel) {
		if (this.stableRequired) {
			return 40 + Math.random() * 20;
		}
		const apex = this.config.jumpForce ** 2 / (2 * this.config.gravity);
		const maximum = apex * Math.max(0.68, 0.78 - worldLevel * 0.02);
		return 40 + Math.random() * Math.max(20, maximum - 40);
	}

	reachableX(last, verticalGap, canvasWidth) {
		const airtime = Math.max(18, Math.sqrt(verticalGap / this.config.gravity) * 2);
		const reach = Math.min(canvasWidth * 0.68, airtime * canvasWidth / 58);
		const proposed = last.x + (Math.random() - 0.5) * reach;
		return Math.max(10, Math.min(proposed, canvasWidth - this.config.platformWidth - 10));
	}

	platformType(worldLevel) {
		if (this.stableRequired) {
			this.stableRequired = false;
			return 'stable';
		}
		const random = Math.random();
		if (random > 0.97 - worldLevel * 0.01) {
			return 'bountiful';
		}
		if (random > 0.9 - worldLevel * 0.04) {
			this.stableRequired = true;
			return 'breakable';
		}
		if (random < 0.12 + worldLevel * 0.04) {
			return 'moving';
		}
		return 'stable';
	}

	populate(platform, state) {
		if (platform.type !== 'stable') {
			return;
		}
		const center = platform.x + platform.width / 2;
		const roll = Math.random();
		if (roll < 0.015 && state.score > 50) {
			state.powerups.push(new Powerup(center, platform.y - 15, 'einSof'));
		} else if (roll < 0.07) {
			const type = Math.random() < 0.5 ? 'shofar' : 'magenDavid';
			state.powerups.push(new Powerup(center, platform.y - 15, type));
		} else if (Math.random() < 0.15 + state.worldLevel * 0.05) {
			state.enemies.push(new Enemy(center, platform.y - 15, this.glyphs, state.worldLevel));
		}
	}
}
