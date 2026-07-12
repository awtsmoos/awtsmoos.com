// B"H
import { clamp, mix } from '../math.js';

/**
 * Cinematic camera cranes into each district, leads player velocity on desktop,
 * breathes while paused, and orbits completed arenas.
 */
export function updateCamera(world, dt) {
	const camera = world.camera;
	const player = world.player;
	camera.idle += dt;
	if (world.mode === 'playing') camera.intro = Math.max(0, camera.intro - dt);
	if (world.won) camera.victory += dt;
	const introRatio = clamp(camera.intro / 4.8, 0, 1);
	const growthDistance = clamp(205 + player.r * 2.2, 250, 480);
	const distance = growthDistance + introRatio * 620;
	const height = clamp(720 + player.r * 7.8, 820, 1580) + introRatio * 820;
	const orbit = orbitAngle(world, camera);
	const leadX = player.vx * 0.36;
	const leadY = player.vy * 0.36;
	const desiredX = player.x + leadX + Math.sin(orbit) * distance * 0.32;
	const desiredY = player.y + leadY - Math.cos(orbit) * distance;
	camera.x = mix(camera.x, desiredX, dt * (introRatio ? 1.3 : 3.3));
	camera.y = mix(camera.y, desiredY, dt * (introRatio ? 1.3 : 3.3));
	camera.z = mix(camera.z, player.z + height, dt * (introRatio ? 1.15 : 2.8));
	camera.targetX = mix(camera.targetX, player.x + leadX, dt * 4);
	camera.targetY = mix(camera.targetY, player.y + leadY, dt * 4);
	camera.targetZ = mix(camera.targetZ, player.z + Math.min(32, player.r * 0.18), dt * 4);
	camera.distance = distance;
	camera.shake = Math.max(0, camera.shake - dt);
}

function orbitAngle(world, camera) {
	if (world.won) return camera.victory * 0.38;
	if (world.mode === 'ready') return camera.idle * 0.08;
	if (world.mode === 'paused') return camera.idle * 0.035;
	return camera.intro > 0 ? camera.intro * 0.18 : 0;
}
