// B"H
// Boruch Hashem
// Blessed is He
import { clamp, heightAt, len, norm } from '../math.js';

/**
 * Momentum responds to growth, pulse, powers, modes, and finite combat stun.
 * Keyboard and touch retain the same acceleration law across every mode.
 */
export function movePlayer(world, dt) {
	const player = world.player;
	if (player.respawn > 0) return tickTimers(world, dt);
	const direction = norm(world.input);
	const magnitude = clamp(len(world.input.x, world.input.y), 0, 1);
	const empowered = world.input.pulse > 0 || world.powerups.surge > 0;
	const ruleScale = world.rules.playerSpeed || 1;
	const stunScale = player.stun > 0 ? 0.35 : 1;
	const maxSpeed = clamp(560 - player.r * 2.35, 275, 515)
		* (empowered ? 1.46 : 1)
		* ruleScale
		* stunScale;
	const acceleration = (empowered ? 1580 : 1320) * magnitude * ruleScale * stunScale;
	player.vx += direction.x * acceleration * dt;
	player.vy += direction.y * acceleration * dt;
	limitVelocity(player, maxSpeed);
	const drag = Math.pow(0.0009, dt);
	player.vx *= drag;
	player.vy *= drag;
	player.x = clamp(player.x + player.vx * dt, -world.level.bounds, world.level.bounds);
	player.y = clamp(player.y + player.vy * dt, -world.level.bounds, world.level.bounds);
	player.z = heightAt(player.x, player.y, world.level.index);
	tickTimers(world, dt);
}

function limitVelocity(player, maxSpeed) {
	const speed = Math.hypot(player.vx, player.vy);
	if (speed <= maxSpeed) return;
	player.vx = player.vx / speed * maxSpeed;
	player.vy = player.vy / speed * maxSpeed;
}

function tickTimers(world, dt) {
	const player = world.player;
	world.input.pulse = Math.max(0, world.input.pulse - dt);
	player.glow = Math.max(0.2, player.glow - dt * 1.1);
	player.comboT = Math.max(0, player.comboT - dt);
	player.grace = Math.max(0, player.grace - dt);
	player.respawn = Math.max(0, player.respawn - dt);
	if (!player.comboT) player.combo += (1 - player.combo) * Math.min(1, dt * 2.2);
}
