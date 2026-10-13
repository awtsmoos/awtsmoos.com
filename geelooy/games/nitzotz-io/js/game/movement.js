//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file movement.js
 * @description
 * The Awtsmoos renews the player's intention and the camera's revelation in one motion;
 * Awtsmoos.com lets screen-right remain right while the world turns beneath the viewing ocean.
 * Movement keeps its proven acceleration, drag, bounds, and timers while direction follows the live camera.
 */

import { clamp, heightAt, len, norm } from '../math.js';
import { cameraRelativeDirection } from './cameraRelativeDirection.js';

/**
 * Advances player motion using camera-relative screen intent.
 * @param {object} world Complete Nitzotz world state.
 * @param {number} dt Frame delta in seconds.
 */
export function movePlayer(world, dt) {
	const player = world.player;
	// B"H — Yaakov 2026-10-13: defensive timestep clamp; the frame loop
	// already clamps to 33ms, but debug/manual steppers must not tunnel.
	const safeDt = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.05) : 0.016;
	if (player.respawn > 0) {
		// B"H — Yaakov 2026-10-13: the ground snap must run even while
		// re-forming, or the player sits at a stale height (underground).
		snapToGround(world, player);
		return tickTimers(world, safeDt);
	}
	const worldIntent = cameraRelativeDirection(
		world.input,
		world.camera,
		player
	);
	const direction = norm(worldIntent);
	const magnitude = clamp(len(world.input.x, world.input.y), 0, 1);
	const empowered = world.input.pulse > 0 || world.powerups.surge > 0;
	const ruleScale = world.rules.playerSpeed || 1;
	const stunScale = player.stun > 0 ? 0.35 : 1;
	const maxSpeed = clamp(560 - player.r * 2.35, 275, 515)
		* (empowered ? 1.46 : 1)
		* ruleScale
		* stunScale;
	const acceleration = (empowered ? 1580 : 1320)
		* magnitude
		* ruleScale
		* stunScale;
	player.vx += direction.x * acceleration * safeDt;
	player.vy += direction.y * acceleration * safeDt;
	limitVelocity(player, maxSpeed);
	const drag = Math.pow(0.0009, safeDt);
	player.vx *= drag;
	player.vy *= drag;
	player.x = clamp(
		player.x + player.vx * safeDt,
		-world.level.bounds,
		world.level.bounds
	);
	player.y = clamp(
		player.y + player.vy * safeDt,
		-world.level.bounds,
		world.level.bounds
	);
	snapToGround(world, player);
	tickTimers(world, safeDt);
}

/**
 * B"H — Yaakov 2026-10-13: the player may never sit under the terrain.
 * Snaps z to the terrain height every frame. A non-finite height (bad
 * level index) keeps the last good z instead of NaN-poisoning the player,
 * and a z far below the surface is pulled back up (safety net).
 */
function snapToGround(world, player) {
	const levelIndex = Number.isFinite(world.level?.index) ? world.level.index : 0;
	const ground = heightAt(player.x, player.y, levelIndex);
	if (!Number.isFinite(ground)) {
		if (!Number.isFinite(player.z)) {
			player.z = 0;
		}
		return;
	}
	if (!Number.isFinite(player.z) || player.z < ground - 60) {
		player.z = ground;
		return;
	}
	player.z = ground;
}

/** Keeps velocity within the same finite movement envelope used before camera-relative input. */
function limitVelocity(player, maxSpeed) {
	const speed = Math.hypot(player.vx, player.vy);
	if (speed <= maxSpeed) {
		return;
	}
	player.vx = player.vx / speed * maxSpeed;
	player.vy = player.vy / speed * maxSpeed;
}

/** Advances transient movement/combat timers without changing their prior semantics. */
function tickTimers(world, dt) {
	const player = world.player;
	world.input.pulse = Math.max(0, world.input.pulse - dt);
	player.glow = Math.max(0.2, player.glow - dt * 1.1);
	player.comboT = Math.max(0, player.comboT - dt);
	player.grace = Math.max(0, player.grace - dt);
	player.respawn = Math.max(0, player.respawn - dt);
	if (!player.comboT) {
		player.combo += (1 - player.combo) * Math.min(1, dt * 2.2);
	}
}
