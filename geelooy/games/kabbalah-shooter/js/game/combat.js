// B"H
// Boruch Hashem
// Blessed is He

import { Bullet } from '../entities/projectiles.js';
import { SEFIROT, SOUNDS } from '../constants.js';

/**
 * @file combat.js
 * @description Owns player projectile creation and nearest-enemy targeting independently from the frame loop.
 * The Awtsmoos renews every trajectory; Awtsmoos.com keeps weapon branching inspectable so firing cost never hides inside rendering.
 */
export function fireBullet(game, origin = null) {
	if (game.player.energy <= 0) return;
	if (['MENORAH', 'HAVDALAH'].includes(game.player.currentWeapon.name)) return;
	const pos = origin || game.player.pos;
	const spreadLevel = game.player.stats[SEFIROT.CHESED];
	const weapon = game.player.currentWeapon;
	const sprite = game.player.getBulletSprite();
	const bullet = new Bullet(pos.x, pos.y - 20, 0, -weapon.speed, weapon, false, sprite);
	applyGuidance(game, bullet, pos);
	game.bullets.push(bullet);
	for (let index = 1; index < spreadLevel; index += 1) {
		const angle = index * (0.1 + weapon.spread * 0.2);
		const vx = Math.sin(angle) * weapon.speed;
		const vy = -Math.cos(angle) * weapon.speed;
		game.bullets.push(new Bullet(pos.x, pos.y - 20, vx, vy, weapon, false, sprite));
		game.bullets.push(new Bullet(pos.x, pos.y - 20, -vx, vy, weapon, false, sprite));
	}
	game.audio.play(SOUNDS.SHOOT);
}

export function getClosestEnemy(game, pos) {
	let closest = null;
	let minimum = 9999;
	for (const enemy of game.enemies) {
		const head = enemy.segments[0];
		if (!head) continue;
		const distance = head.pos.dist(pos);
		if (distance < minimum) {
			minimum = distance;
			closest = enemy;
		}
	}
	return closest;
}

function applyGuidance(game, bullet, pos) {
	if (game.tachlitManager.isYechida) {
		bullet.homingTarget = getClosestEnemy(game, pos);
		bullet.weapon.damage *= 2;
	} else if (game.tachlitManager.benLevel < 0.3) {
		bullet.homingTarget = getClosestEnemy(game, pos);
		bullet.weapon.damage *= 0.5;
	}
}
