// B"H
import {
	entryRightRevealWorld,
	normalizeDoorFrame
} from './HouseDoorGeometry.js';

/** Places a fixed mezuzah on the right jamb seen while entering the house. */
export function createMezuzaDef(specification, material = {}) {
	const frame = normalizeDoorFrame(specification);
	const caseWidth = Math.min(0.16, frame.wall.thickness * 0.2);
	const caseHeight = Math.min(0.78, frame.opening.height * 0.24);
	const caseDepth = 0.07;
	const revealDepth = Math.min(frame.wall.thickness * 0.22, 0.16);
	const jambInset = caseDepth / 2 + 0.035;
	const point = entryRightRevealWorld(frame, jambInset, revealDepth);
	const delta = {
		x: point.x - frame.center.x,
		y: 0,
		z: point.z - frame.center.z
	};
	const dotFromOpeningCenter = dot(delta, frame.entry.right);
	const worldPosition = {
		x: point.x,
		y: frame.opening.bottomY + frame.opening.height * 0.69,
		z: point.z
	};
	const evidence = {
		id: `${frame.doorId}-mezuza`,
		doorId: frame.doorId,
		wallId: frame.wallId,
		houseId: frame.houseId,
		entrySide: 'right',
		enteringDirection: frame.basis.inward,
		enteringRight: frame.entry.right,
		localPosition: {
			x: frame.entry.rightJambLocalX - jambInset,
			y: worldPosition.y - frame.opening.bottomY,
			z: -revealDepth
		},
		worldPosition,
		position: { x: point.x, z: point.z },
		revealDepth,
		facingDirection: frame.entry.right,
		forward: frame.entry.right,
		dotFromOpeningCenter,
		placement: 'inside-reveal',
		facing: 'across-cavity',
		hingeSide: frame.hinge.side,
		verifiedBy: 'world-basis-test'
	};
	return {
		id: evidence.id,
		shape: 'box',
		solid: false,
		walkable: false,
		noEdge: true,
		color: material.color || '#b58a28',
		mapImage: material.mapImage || null,
		textureUrl: material.textureUrl || null,
		mapRepeat: [1, 1],
		position: worldPosition,
		size: {
			x: caseWidth,
			y: caseHeight,
			z: caseDepth
		},
		rotation: {
			y: frame.entry.acrossYaw,
			z: -0.1
		},
		userData: { AwtsmoosMezuza: evidence }
	};
}

function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}
