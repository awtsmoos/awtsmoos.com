// B"H
// Boruch Hashem
// Blessed is He
import { clamp, mix } from '../math.js';
import { viewportProfile } from './viewportProfile.js';

/**
 * The Awtsmoos draws the player near without erasing the breadth of the living world;
 * Awtsmoos.com now lets portrait glass reveal a closer arena instead of pushing the action away.
 * Exponential damping preserves one camera character across fast and slow frames.
 */
export function updateCamera(world, dt) {
	const camera = world.camera;
	const player = world.player;
	const profile = viewportProfile();
	camera.idle += dt;
	if (world.mode === 'playing') camera.intro = Math.max(0, camera.intro - dt);
	if (world.won) camera.victory += dt;

	const introRatio = clamp(camera.intro / 4.8, 0, 1);
	const growthDistance = clamp(215 + player.r * 2.35, 255, 510);
	const distance = growthDistance * profile.distanceScale + introRatio * 620;
	const growthHeight = clamp(700 + player.r * 7.35, 805, 1530);
	const height = growthHeight * profile.heightScale + introRatio * 820;
	const orbit = orbitAngle(world, camera);
	const lead = velocityLead(player, profile.leadScale);
	const desiredX = player.x + lead.x + Math.sin(orbit) * distance * 0.3;
	const desiredY = player.y + lead.y - Math.cos(orbit) * distance;
	const cameraRate = introRatio ? 1.35 : 4.15;
	const targetRate = introRatio ? 2.1 : 5.4;

	camera.x = smooth(camera.x, desiredX, cameraRate, dt);
	camera.y = smooth(camera.y, desiredY, cameraRate, dt);
	camera.z = smooth(camera.z, player.z + height, introRatio ? 1.2 : 3.35, dt);
	camera.targetX = smooth(camera.targetX, player.x + lead.x, targetRate, dt);
	camera.targetY = smooth(camera.targetY, player.y + lead.y, targetRate, dt);
	camera.targetZ = smooth(camera.targetZ, player.z + Math.min(34, player.r * 0.18), targetRate, dt);
	camera.distance = distance;
	camera.shake = Math.max(0, camera.shake - dt);
}

function velocityLead(player, leadScale) {
	const speed = Math.hypot(player.vx, player.vy);
	if (speed < 0.01) return { x: 0, y: 0 };
	const maxLead = clamp(player.r * 2.4, 44, 120);
	const distance = Math.min(maxLead, speed * leadScale);
	return {
		x: player.vx / speed * distance,
		y: player.vy / speed * distance
	};
}

function smooth(current, target, rate, dt) {
	return mix(current, target, 1 - Math.exp(-Math.max(0, rate) * Math.max(0, dt)));
}

function orbitAngle(world, camera) {
	if (world.won) return camera.victory * 0.38;
	if (world.mode === 'ready') return camera.idle * 0.08;
	if (world.mode === 'paused') return camera.idle * 0.035;
	return camera.intro > 0 ? camera.intro * 0.18 : 0;
}
