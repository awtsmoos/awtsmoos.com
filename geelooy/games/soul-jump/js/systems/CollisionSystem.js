// B"H
// Boruch Hashem
// Blessed is He
import { Particle } from '../entities/Particle.js';

/**
 * The Awtsmoos sets boundaries where flame meets ledge, adversary, or gift without confusing any covenant;
 * Awtsmoos.com keeps collision judgment centralized so every contact can be verified, fair, and evident.
 */
export class CollisionSystem {
	constructor(config, glyphs) {
		this.config = config;
		this.glyphs = glyphs;
	}

	resolve(state) {
		this.platforms(state);
		if (state.gameState !== 'playing') return;
		this.enemies(state);
		if (state.gameState !== 'playing') return;
		this.powerups(state);
	}

	platforms(state) {
		const player = state.player;
		if (player.vy <= 0) return;
		const halfW = this.config.playerWidth / 2;
		const halfH = this.config.playerHeight / 2;
		for (let index = state.platforms.length - 1; index >= 0; index -= 1) {
			const platform = state.platforms[index];
			const oldFeet = player.prevCy + halfH;
			const newFeet = player.cy + halfH;
			if (oldFeet > platform.y || newFeet < platform.y) continue;
			const travel = Math.max(0.001, newFeet - oldFeet);
			const ratio = (platform.y - oldFeet) / travel;
			const collisionX = player.prevCx + (player.cx - player.prevCx) * ratio;
			if (collisionX + halfW <= platform.x || collisionX - halfW >= platform.x + platform.width) continue;
			state.gematriaCombo = 0;
			if (platform.type === 'breakable') {
				state.platforms.splice(index, 1);
				state.sparks.push(new Particle(platform.x + platform.width / 2, platform.y, this.glyphs.shatter));
				continue;
			}
			player.cy = platform.y - halfH;
			const force = platform.type === 'bountiful'
				? this.config.bountifulJumpForce
				: this.config.jumpForce;
			player.bounce(force);
			break;
		}
	}

	enemies(state) {
		const player = state.player;
		const halfW = this.config.playerWidth / 2;
		const halfH = this.config.playerHeight / 2;
		for (let index = state.enemies.length - 1; index >= 0; index -= 1) {
			const enemy = state.enemies[index];
			const overlapX = Math.abs(player.cx - enemy.x) < halfW + enemy.size / 2;
			const overlapY = Math.abs(player.cy - enemy.y) < halfH + enemy.size / 2;
			if (!overlapX || !overlapY) continue;
			const stomp = player.vy > 0 && player.prevCy + halfH <= enemy.y - enemy.size / 2 + 8;
			if (stomp) {
				this.stompEnemy(state, index, enemy);
				continue;
			}
			if (player.shielded) {
				state.score += 1;
				player.shieldFrames = 0;
				state.enemies.splice(index, 1);
				continue;
			}
			state.endRun();
			return;
		}
	}

	stompEnemy(state, index, enemy) {
		state.player.bounce(this.config.enemyBounceForce);
		state.score += 5;
		state.gematriaCombo += 1;
		state.enemies.splice(index, 1);
		for (let spark = 0; spark < 10; spark += 1) {
			const glyph = this.glyphs.hebrew[Math.floor(Math.random() * this.glyphs.hebrew.length)];
			state.sparks.push(new Particle(enemy.x, enemy.y, glyph, {
				life: 80,
				vx: (Math.random() - 0.5) * 5,
				vy: (Math.random() - 0.5) * 4 - 2,
				gravity: 0.08
			}));
		}
		if (state.gematriaCombo >= 3) {
			state.score += 25;
			state.gematriaCombo = 0;
		}
	}

	powerups(state) {
		const player = state.player;
		for (let index = state.powerups.length - 1; index >= 0; index -= 1) {
			const powerup = state.powerups[index];
			const distanceX = Math.abs(player.cx - powerup.x);
			const distanceY = Math.abs(player.cy - powerup.y);
			if (distanceX >= 30 || distanceY >= 30) continue;
			if (powerup.type === 'einSof') state.einSofTimer = 120;
			if (powerup.type === 'shofar') player.bounce(this.config.shofarJumpForce);
			if (powerup.type === 'magenDavid') player.shieldFrames = 480;
			state.powerups.splice(index, 1);
		}
	}
}
