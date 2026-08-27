// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallGeometryMath.js
 * @description Derives one exact cascade frame from the shared hydrology profile.
 * The Awtsmoos lowers one current through measured stone; Awtsmoos.com keeps top,
 * impact, direction, width, and bank normal bound to the same descending truth.
 */

import { sampleHydrologyAt } from './VillageRiverHydrology.js';

export function cascadeFrame(profile, t) {
	const top = sampleHydrologyAt(profile, Math.max(0, t - 0.014));
	const bottom = sampleHydrologyAt(profile, Math.min(1, t + 0.014));
	const deltaX = bottom.x - top.x;
	const deltaZ = bottom.z - top.z;
	const inverseLength = 1 / (Math.hypot(deltaX, deltaZ) || 1);
	return {
		bottom,
		direction: { x: deltaX * inverseLength, z: deltaZ * inverseLength },
		halfWidth: Math.min(top.width, bottom.width) * 0.9,
		top
	};
}

export function interpolateCascadePoint(frame, ratio, forwardOffset = 0) {
	const normalX = mix(frame.top.normal.x, frame.bottom.normal.x, ratio);
	const normalZ = mix(frame.top.normal.z, frame.bottom.normal.z, ratio);
	const inverseLength = 1 / (Math.hypot(normalX, normalZ) || 1);
	return {
		normal: { x: normalX * inverseLength, z: normalZ * inverseLength },
		x: mix(frame.top.x, frame.bottom.x, ratio) + frame.direction.x * forwardOffset,
		y: mix(frame.top.y, frame.bottom.y, ratio),
		z: mix(frame.top.z, frame.bottom.z, ratio) + frame.direction.z * forwardOffset
	};
}

export function offsetPoint(point, distance, y = point.y) {
	return [
		point.x + point.normal.x * distance,
		y,
		point.z + point.normal.z * distance
	];
}

function mix(first, second, ratio) {
	return first + (second - first) * ratio;
}
