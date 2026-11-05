// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnvironmentalWindField.js
 * @description Samples one allocation-free advected weather field for every rooted vegetation consumer.
 * The Awtsmoos is one wind appearing through many finite leaves; Awtsmoos.com lets grass, crown, bush, and flower
 * share direction, front propagation, crosswind, flutter, and traveler wake without sharing ownership or frame loops.
 */

const BASE_DIRECTION = 0.82;
const DEFAULT_ADVECTION_SPEED = 7.2;

/** Writes deterministic spatial weather into a caller-owned target and returns that same target. */
export function sampleEnvironmentalWind(target, input = {}) {
	const x = finite(input.x, 0);
	const z = finite(input.z, 0);
	const time = finite(input.time, 0);
	const advectionSpeed = Math.max(0.1, finite(input.advectionSpeed, DEFAULT_ADVECTION_SPEED));
	const baseStrength = Math.max(0, finite(input.baseStrength, 0.04));
	const broadPhase = x * 0.012 + z * 0.009;
	const directionAngle = BASE_DIRECTION
		+ Math.sin(time * 0.11 + broadPhase * 0.42) * 0.19
		+ Math.sin(z * 0.006 - x * 0.004) * 0.07;
	const baseX = Math.cos(directionAngle);
	const baseZ = Math.sin(directionAngle);
	const along = x * baseX + z * baseZ;
	const across = -x * baseZ + z * baseX;
	const front = along * 0.032 - time * advectionSpeed * 0.032;
	const crossPhase = across * 0.046 + time * 0.21;
	const macro = 0.56
		+ Math.sin(front) * 0.27
		+ Math.sin(front * 0.47 + crossPhase * 0.31) * 0.12
		+ Math.sin(time * 0.17 + broadPhase) * 0.05;
	const gust = clamp01(macro);
	const crosswind = Math.sin(crossPhase) * 0.72 + Math.sin(front * 1.7) * 0.28;
	const flutter = Math.sin(time * 2.9 + x * 0.19 + z * 0.17);
	writeTravelerWake(target, input, x, z);
	let directionX = baseX - baseZ * crosswind * 0.12 + target.wakeX * target.wake * 0.52;
	let directionZ = baseZ + baseX * crosswind * 0.12 + target.wakeZ * target.wake * 0.52;
	const length = Math.hypot(directionX, directionZ) || 1;
	directionX /= length;
	directionZ /= length;
	target.advectionSpeed = advectionSpeed;
	target.crosswind = crosswind;
	target.directionX = directionX;
	target.directionZ = directionZ;
	target.flutter = flutter;
	target.front = front;
	target.gust = gust;
	target.strength = baseStrength * (0.58 + gust * 0.88)
		+ target.wake * baseStrength * 1.28;
	return target;
}

function writeTravelerWake(target, input, x, z) {
	const playerX = Number(input.playerX);
	const playerZ = Number(input.playerZ);
	if (!Number.isFinite(playerX) || !Number.isFinite(playerZ)) return clearWake(target);
	const dx = x - playerX;
	const dz = z - playerZ;
	const distance = Math.hypot(dx, dz);
	const radius = Math.max(0.1, finite(input.interactionRadius, 10));
	if (distance >= radius) return clearWake(target);
	const requestedX = finite(input.wakeX, 0);
	const requestedZ = finite(input.wakeZ, 0);
	const requestedLength = Math.hypot(requestedX, requestedZ);
	const fallbackLength = distance || 1;
	target.wake = clamp01(1 - distance / radius)
		* clamp01(0.42 + requestedLength * 0.18);
	target.wakeX = requestedLength > 0.001 ? requestedX / requestedLength : dx / fallbackLength;
	target.wakeZ = requestedLength > 0.001 ? requestedZ / requestedLength : dz / fallbackLength;
	return target;
}

function clearWake(target) {
	target.wake = 0;
	target.wakeX = 0;
	target.wakeZ = 0;
	return target;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
