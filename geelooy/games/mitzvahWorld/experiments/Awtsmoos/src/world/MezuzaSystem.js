// B"H
import { entryRightRevealWorld, normalizeDoorFrame } from './HouseDoorGeometry.js';

/**
 * Places the mezuzah inside the right-hand doorway reveal as seen by a person
 * entering the house. It is not attached to the exterior wall surface; it sits
 * within the cavity and remains visible from outside.
 */
export function createMezuzaDef(specification, material = {}) {
	const frame = normalizeDoorFrame(specification);
	const width = 0.11;
	const height = Math.min(0.72, frame.doorH * 0.27);
	const depth = Math.min(0.08, frame.wallT * 0.22);
	const point = entryRightRevealWorld(frame, 0.045);
	return {
		id: `${frame.doorId}-mezuza`,
		shape: 'box',
		solid: false,
		walkable: false,
		noEdge: true,
		color: material.color || '#b58a28',
		mapImage: material.mapImage || null,
		textureUrl: material.textureUrl || null,
		mapRepeat: [1, 1],
		position: {
			x: point.x,
			y: frame.floorY + frame.doorH * 0.66,
			z: point.z
		},
		size: {
			x: width,
			y: height,
			z: depth
		},
		rotation: {
			y: frame.yaw,
			z: -0.1
		},
		userData: {
			AwtsmoosMezuza: {
				doorId: frame.doorId,
				jamb: 'entry-right-reveal',
				placement: 'inside-door-cavity',
				entryDirection: frame.entryDirection,
				yaw: frame.yaw
			}
		}
	};
}
