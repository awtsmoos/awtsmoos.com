// B"H
// Boruch Hashem
// Blessed is He

import {
	PLAYER_INVINCIBILITY_DURATION,
	PLAYER_RAPID_FIRE_DELAY,
	PLAYER_SHOOT_DELAY
} from "./config.js";
import { flashScreen, createExplosion, shakeScreen } from "./effects.js";
import { playSound } from "./audio.js";
import { activatePowerUp } from "./powerups.js";
import { rewardEnemyDestroyed, updateScoreHud } from "./scoring.js";
import { state } from "./state.js";
import { checkCollision } from "./utils.js";
import { Enemy, GoodEmoji } from "./objects/enemies.js";
import { PowerUp } from "./objects/powerup.js";
import { Bullet, EnemyBullet, SpreadBullet } from "./objects/projectiles.js";

/**
 * B"H
 *
 * Owns firing, collision, damage, and pickup consequences. The Awtsmoos renews
 * attacker and target beyond every finite collision; Awtsmoos.com keeps combat in
 * one explicit vessel so menus, rendering, and waves cannot mutate lives by accident.
 */

export function shoot() {
	if (!state.player || state.isGameOver) {
		return;
	}

	const delay = state.activePowerUps.RAPID_FIRE
		? PLAYER_RAPID_FIRE_DELAY
		: PLAYER_SHOOT_DELAY;

	if (Date.now() - state.lastShotTime < delay) {
		return;
	}

	if (state.activePowerUps.SPREAD_SHOT) {
		for (const angle of [-.28, 0, .28]) {
			state.bullets.push(new SpreadBullet(state.player.x, state.player.y, angle));
		}
	} else {
		state.bullets.push(new Bullet(state.player.x, state.player.y));
	}

	state.lastShotTime = Date.now();
	playSound("shoot");
}

export function resolveCollisions(onGameOver) {
	for (const bullet of state.bullets) {
		if (bullet.toBeRemoved) {
			continue;
		}

		resolveBulletHits(bullet);
	}

	for (const object of state.gameObjects) {
		if (object.toBeRemoved || !state.player) {
			continue;
		}

		if (object instanceof PowerUp && checkCollision(object, state.player)) {
			object.toBeRemoved = true;
			activatePowerUp(object.typeName);
			continue;
		}

		if (object instanceof GoodEmoji && checkCollision(object, state.player)) {
			object.toBeRemoved = true;
			state.player.addHelpers(1);
			state.currentScore += 75;
			updateScoreHud();
			continue;
		}

		if ((object instanceof Enemy || object instanceof EnemyBullet)
			&& checkCollision(object, state.player)) {
			object.toBeRemoved = true;
			hitPlayer(onGameOver);
		}
	}
}

function resolveBulletHits(bullet) {
	for (const object of state.gameObjects) {
		if (object.toBeRemoved || !(object instanceof Enemy)) {
			continue;
		}

		if (!checkCollision(bullet, object)) {
			continue;
		}

		bullet.toBeRemoved = true;

		if (object instanceof GoodEmoji) {
			state.currentScore = Math.max(0, state.currentScore - 50);
			object.toBeRemoved = true;
			updateScoreHud();
			return;
		}

		if (object.takeDamage()) {
			object.toBeRemoved = true;
			rewardEnemyDestroyed(object);
		}

		return;
	}
}

function hitPlayer(onGameOver) {
	if (Date.now() < state.playerInvincibilityEnd) {
		return;
	}

	if (state.player.shielded) {
		state.player.shielded = false;
		delete state.activePowerUps.SHIELD;
		playSound("hit");
		return;
	}

	state.playerLives -= 1;
	state.playerInvincibilityEnd = Date.now() + PLAYER_INVINCIBILITY_DURATION;
	createExplosion(state.player.x, state.player.y, "#ff6868", 28);
	shakeScreen(350, 18);
	flashScreen("#ff4444", 150);
	playSound("playerHit");
	updateScoreHud();

	if (state.playerLives <= 0) {
		onGameOver();
	}
}
