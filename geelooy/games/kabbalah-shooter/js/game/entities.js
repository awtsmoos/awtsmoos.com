// B"H
// Boruch Hashem
// Blessed is He

import { Bullet } from '../entities/projectiles.js';
import { COLORS, CONFIG, SEFIROT, SOUNDS } from '../constants.js';
import { Vec2 } from '../math.js';

/**
 * @file entities.js
 * @description Advances transient Kabbalah Shooter entities while keeping time-scale mutation temporary and reversible.
 * The Awtsmoos renews every moving spark; Awtsmoos.com prevents visual slow-time from permanently corrupting projectile or enemy velocity.
 */
export function updateEntities(game) {
	updateBitulMagnetism(game);
	updateGravityWells(game);
	updateBullets(game);
	game.enemyBullets = game.enemyBullets.filter(bullet => {
		bullet.update();
		return bullet.active;
	});
	game.enemies = game.enemies.filter(enemy => updateEnemy(game, enemy));
	game.metatronShapes.forEach(shape => shape.update());
	game.metatronShapes = game.metatronShapes.filter(shape => shape.active);
	game.particles = game.particles.filter(particle => {
		particle.update();
		return particle.life > 0;
	});
	game.powerups = game.powerups.filter(powerup => updatePowerup(powerup));
	game.texts = game.texts.filter(text => {
		text.update();
		return text.life > 0;
	});
	game.letters = game.letters.filter(letter => {
		letter.update();
		return letter.active;
	});
	updateStars(game);
}

function updateBitulMagnetism(game) {
	if (!game.player.isBitul) return;
	if (game.frameCount % 10 === 0) {
		game.spawnImplosion(game.player.pos.x, game.player.pos.y, COLORS.WHITE);
		game.audio.play(SOUNDS.BITUL);
	}
	const range = game.player.stats[SEFIROT.HOD];
	for (const letter of game.letters) {
		const delta = Vec2.sub(game.player.pos, letter.pos);
		if (delta.mag() < range) letter.pos.add(delta.normalize().mult(5 * game.timeScale));
	}
}

function updateGravityWells(game) {
	for (const well of game.gravityWells) {
		well.update();
		for (const enemy of game.enemies) {
			for (const segment of enemy.segments) {
				const delta = Vec2.sub(well.pos, segment.pos);
				if (delta.mag() < well.radius * 2) segment.pos.add(delta.normalize().mult(CONFIG.GRAVITY_WELL_FORCE * game.timeScale));
			}
		}
	}
	game.gravityWells = game.gravityWells.filter(well => well.active);
}

function updateBullets(game) {
	game.bullets = game.bullets.filter(bullet => {
		const original = new Vec2(bullet.vel.x, bullet.vel.y);
		bullet.vel.mult(game.timeScale);
		const xBefore = bullet.pos.x;
		bullet.update();
		if (Math.abs(bullet.pos.x - xBefore) > 100 && bullet.wrapCount < CONFIG.UFARATZTA_LIMIT) {
			const clone = new Bullet(bullet.pos.x, bullet.pos.y, -bullet.vel.x, bullet.vel.y, bullet.weapon, bullet.isBeam, bullet.sprite);
			clone.wrapCount = bullet.wrapCount;
			game.bullets.push(clone);
		}
		bullet.vel.set(original.x, original.y);
		return bullet.active;
	});
}

function updateEnemy(game, enemy) {
	const originalSpeed = enemy.speed || 0;
	if (enemy.speed) enemy.speed *= game.timeScale;
	enemy.update(game.height, game);
	if (enemy.speed) enemy.speed = originalSpeed;
	return enemy.active;
}

function updatePowerup(powerup) {
	if (powerup.update) powerup.update();
	else {
		powerup.pos.y += 2;
		if (powerup.pos.y > 2000) powerup.active = false;
	}
	return powerup.active;
}

function updateStars(game) {
	const speed = (game.worldLevel + 1) * 1.5 * game.timeScale;
	for (const star of game.stars) {
		star.y += star.z * (1 + game.combo * 0.1) * speed * 0.5;
		if (star.y > game.height) {
			star.y = -10;
			star.x = Math.random() * game.width;
		}
	}
}
