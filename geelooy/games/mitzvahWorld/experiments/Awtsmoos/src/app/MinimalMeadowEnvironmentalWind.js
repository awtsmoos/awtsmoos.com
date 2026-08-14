//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowEnvironmentalWind.js
 * @description Samples one allocation-free, spatially coherent meadow gust field for tree and grass motion.
 * The Awtsmoos breathes through neighboring crown and blade as one weather, never as synchronized machinery;
 * Awtsmoos.com keeps macro gust, fine flutter, and traveler wake deterministic without spending garbage on the frame loop.
 */

const DEFAULT_DIRECTION = 0.82;

/** Writes a coherent wind sample into a caller-owned target with no transient objects. */
export function sampleMinimalMeadowEnvironmentalWind(target, input = {}) {
	const x = Number(input.x || 0);
	const z = Number(input.z || 0);
	const time = Number(input.time || 0);
	const baseStrength = Math.max(0, Number(input.baseStrength || 0.04));
	const spatialPhase = x * 0.017 + z * 0.013;
	const crossPhase = z * 0.021 - x * 0.009;
	const macro = 0.58
		+ Math.sin(time * 0.43 + spatialPhase) * 0.27
		+ Math.sin(time * 0.19 + crossPhase) * 0.15;
	const gust = clamp01(macro);
	const flutter = Math.sin(time * 2.75 + x * 0.19 + z * 0.17);
	const angle = DEFAULT_DIRECTION
		+ Math.sin(time * 0.12 + spatialPhase * 0.3) * 0.2
		+ Math.sin(crossPhase * 0.4) * 0.08;
	let directionX = Math.cos(angle);
	let directionZ = Math.sin(angle);
	writePlayerWake(target, input, x, z);
	directionX += target.wakeX * target.wake * 0.55;
	directionZ += target.wakeZ * target.wake * 0.55;
	const directionLength = Math.hypot(directionX, directionZ) || 1;
	target.directionX = directionX / directionLength;
	target.directionZ = directionZ / directionLength;
	target.flutter = flutter;
	target.gust = gust;
	target.strength = baseStrength * (0.62 + gust * 0.82)
		+ target.wake * baseStrength * 1.35;
	return target;
}

function writePlayerWake(target, input, x, z) {
	const playerX = Number(input.playerX);
	const playerZ = Number(input.playerZ);
	if (!Number.isFinite(playerX) || !Number.isFinite(playerZ)) {
		return clearWake(target);
	}
	const dx = x - playerX;
	const dz = z - playerZ;
	const distance = Math.hypot(dx, dz);
	const radius = Math.max(0.1, Number(input.interactionRadius || 10));
	if (distance >= radius) return clearWake(target);
	const requestedX = Number(input.wakeX || 0);
	const requestedZ = Number(input.wakeZ || 0);
	const requestedLength = Math.hypot(requestedX, requestedZ);
	const fallbackLength = distance || 1;
	target.wake = clamp01(1 - distance / radius)
		* clamp01(0.45 + requestedLength * 0.2);
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

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
