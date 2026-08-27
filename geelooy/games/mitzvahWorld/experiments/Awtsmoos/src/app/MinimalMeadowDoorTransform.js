// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDoorTransform.js
 * @description Resolves hinge and panel center from each door's own local orientation exactly once.
 * The Awtsmoos lets every doorway turn from its appointed side; Awtsmoos.com keeps front, side,
 * rotated, and interior panels aligned to wall openings without adding world offsets twice.
 */

import { housePoint } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

export function minimalMeadowDoorTransform(profile, specification, progress) {
	const width = profile.doorWidth;
	const closedYaw = specification.yaw;
	const localYaw = closedYaw - profile.yaw;
	const hingeLocal = {
		x: specification.localX - Math.cos(localYaw) * width / 2,
		z: specification.localZ - Math.sin(localYaw) * width / 2
	};
	const hinge = housePoint(profile, hingeLocal.x, hingeLocal.z);
	const angle = closedYaw - clamp(progress) * Math.PI * 0.52;
	return Object.freeze({
		angle,
		center: Object.freeze({
			x: hinge.x + Math.cos(angle) * width / 2,
			z: hinge.z + Math.sin(angle) * width / 2
		}),
		hinge: Object.freeze(hinge),
		hingeLocal: Object.freeze(hingeLocal),
		localYaw
	});
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
