// B"H
import {
	entryRightRevealWorld,
	normalizeDoorFrame
} from './HouseDoorGeometry.js';

/**
 * Places the mezuzah on the entering person's right, inside the reveal. Its
 * thin axis faces across the cavity toward the opposite jamb, not along the
 * broad exterior wall where the old illusion placed it.
 */
export function createMezuzaDef(specification, material = {}) {
	const frame = normalizeDoorFrame(specification);
	const caseWidth = Math.min(0.16, frame.wall.thickness * 0.2);
	const caseHeight = Math.min(0.78, frame.opening.height * 0.24);
	const caseDepth = 0.07;
	const point = entryRightRevealWorld(frame, caseDepth / 2 + 0.035);
	const forward = frame.basis.right;
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
			y: frame.opening.bottomY + frame.opening.height * 0.69,
			z: point.z
		},
		size: {
			x: caseWidth,
			y: caseHeight,
			z: caseDepth
		},
		rotation: {
			y: frame.entry.acrossYaw,
			z: -0.1
		},
		userData: {
			AwtsmoosMezuza: {
				id: `${frame.doorId}-mezuza`,
				doorId: frame.doorId,
				wallId: frame.wallId,
				houseId: frame.houseId,
				entrySide: 'right',
				placement: 'inside-reveal',
				facing: 'across-cavity',
				hingeSide: frame.hinge.side,
				position: { x: point.x, z: point.z },
				forward
			}
		}
	};
}
