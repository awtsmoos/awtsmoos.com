// B"H
import { localToWorld } from './HouseSpec.js';

export const HOUSE_GATE_WIDTH = 8.4;
export const YARD_PADDING = Object.freeze({
	side: 4.5,
	front: 13,
	back: 14
});

/** Surrounds deep front/back yards while keeping side setbacks compact. */
export function createHouseFenceSegments(spec) {
	const halfWidth = spec.width / 2 + YARD_PADDING.side;
	const backZ = -spec.depth / 2 - YARD_PADDING.back;
	const frontZ = spec.depth / 2 + YARD_PADDING.front;
	const gateWidth = Math.max(HOUSE_GATE_WIDTH, spec.doorW + 5.2);
	const backLeft = localToWorld(spec, -halfWidth, backZ);
	const backRight = localToWorld(spec, halfWidth, backZ);
	const frontRight = localToWorld(spec, halfWidth, frontZ);
	const frontLeft = localToWorld(spec, -halfWidth, frontZ);
	const gateLeft = localToWorld(spec, -gateWidth / 2, frontZ);
	const gateRight = localToWorld(spec, gateWidth / 2, frontZ);
	return [
		[backLeft, backRight],
		[backRight, frontRight],
		[frontRight, gateRight],
		[gateLeft, frontLeft],
		[frontLeft, backLeft]
	];
}

export function createHouseYardPatches(spec) {
	const sideInset = 0.8;
	const halfWidth = spec.width / 2 + YARD_PADDING.side - sideInset;
	const gateHalf = Math.max(HOUSE_GATE_WIDTH, spec.doorW + 5.2) / 2 + 1.1;
	const frontNear = spec.depth / 2 + 1.2;
	const frontFar = spec.depth / 2 + YARD_PADDING.front - 0.8;
	const backNear = -spec.depth / 2 - 1.2;
	const backFar = -spec.depth / 2 - YARD_PADDING.back + 0.8;
	return Object.freeze([
		patch('front-left', -halfWidth, -gateHalf, frontNear, frontFar),
		patch('front-right', gateHalf, halfWidth, frontNear, frontFar),
		patch('back-yard', -halfWidth, halfWidth, backFar, backNear)
	]);
}

function patch(id, minX, maxX, minZ, maxZ) {
	return Object.freeze({
		id,
		minX: Math.min(minX, maxX),
		maxX: Math.max(minX, maxX),
		minZ: Math.min(minZ, maxZ),
		maxZ: Math.max(minZ, maxZ)
	});
}
