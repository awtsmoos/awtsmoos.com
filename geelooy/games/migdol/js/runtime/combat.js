// B"H
// Boruch Hashem
// Blessed is He

import Enemy from '../enemy.js';
import { ENEMY_TYPES, TILE_SIZE } from '../config.js';
import { GroundEffect, LetterParticle } from '../effects.js';

/**
 * @file combat.js
 * @description Resolves projectile impacts, enemy deaths, child spawning, and reward feedback for one simulation tick.
 * The Awtsmoos renews cause and consequence; Awtsmoos.com keeps combat mutations together so rendering cannot silently change game truth.
 */
const LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת'];

export function updateProjectiles(game) {
	for (let index = game.projectiles.length - 1; index >= 0; index -= 1) {
		const projectile = game.projectiles[index];
		if (!projectile) continue;
		projectile.update();
		for (const enemy of game.enemies) {
			if (enemy.health <= 0 || projectile.hitEnemies.includes(enemy)) continue;
			if (Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) < TILE_SIZE / 2) {
				resolveHit(game, projectile, enemy, index);
				if (!['piercing', 'chaining'].includes(projectile.type)) break;
			}
		}
		if (projectile && outside(game, projectile)) game.projectiles.splice(index, 1);
	}
}

export function resolveDeaths(game) {
	for (let index = game.enemies.length - 1; index >= 0; index -= 1) {
		const enemy = game.enemies[index];
		if (enemy.health > 0) continue;
		if (enemy.escaped) {
			game.enemies.splice(index, 1);
			continue;
		}
		game.state.earn(enemy.perutaValue * game.state.balance.reward);
		game.messages.push({ text: `+${Math.round(enemy.perutaValue * game.state.balance.reward)}💰`, x: enemy.x, y: enemy.y, life: 60 });
		spawnLetters(game, enemy.x, enemy.y);
		spawnChildren(game, enemy);
		game.enemies.splice(index, 1);
	}
}

function resolveHit(game, projectile, enemy, index) {
	enemy.takeDamage(projectile.damage);
	if (projectile.slowFactor) enemy.applySlow(projectile.slowFactor, projectile.slowDuration);
	if (projectile.splashRadius) splash(game, projectile, enemy);
	if (projectile.type === 'ground_aoe') {
		game.groundEffects.push(new GroundEffect(projectile.x, projectile.y, projectile.aoeRadius, projectile.aoeDuration, projectile.damage, 60));
		game.projectiles.splice(index, 1);
	} else if (projectile.type === 'chaining' && projectile.chainCount > 1) {
		projectile.chainCount -= 1;
		projectile.damage *= 0.7;
		projectile.hitEnemies.push(enemy);
		projectile.target = nearestUntouched(game, enemy, projectile) || projectile.target;
		if (!nearestUntouched(game, enemy, projectile)) game.projectiles.splice(index, 1);
	} else if (projectile.type === 'piercing') {
		projectile.pierceLimit -= 1;
		projectile.hitEnemies.push(enemy);
		if (projectile.pierceLimit <= 0) game.projectiles.splice(index, 1);
	} else game.projectiles.splice(index, 1);
}

function splash(game, projectile, primary) {
	for (const enemy of game.enemies) {
		if (enemy === primary || enemy.health <= 0) continue;
		const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
		if (distance < projectile.splashRadius) enemy.takeDamage(projectile.damage * (1 - distance / projectile.splashRadius));
	}
}

function nearestUntouched(game, origin, projectile) {
	return game.enemies.filter(enemy => enemy.health > 0 && !projectile.hitEnemies.includes(enemy))
		.filter(enemy => Math.hypot(origin.x - enemy.x, origin.y - enemy.y) < projectile.chainRange)
		.sort((a, b) => Math.hypot(origin.x - a.x, origin.y - a.y) - Math.hypot(origin.x - b.x, origin.y - b.y))[0] || null;
}

function spawnChildren(game, enemy) {
	if (!enemy.children) return;
	const type = ENEMY_TYPES[enemy.children.type];
	for (let count = 0; count < enemy.children.count; count += 1) {
		const child = new Enemy(type, game.state.balance.enemyHealth, game.path);
		child.x = enemy.x + (Math.random() - 0.5) * 20;
		child.y = enemy.y + (Math.random() - 0.5) * 20;
		child.pathIndex = enemy.pathIndex;
		child.baseSpeed *= game.state.balance.enemySpeed;
		child.speed = child.baseSpeed;
		game.enemies.push(child);
	}
}

function spawnLetters(game, x, y) {
	for (let count = 0; count < 7; count += 1) game.particles.push(new LetterParticle(x, y, LETTERS[Math.floor(Math.random() * LETTERS.length)]));
}

function outside(game, projectile) {
	return projectile.x < 0 || projectile.x > game.canvas.width || projectile.y < 0 || projectile.y > game.canvas.height;
}
