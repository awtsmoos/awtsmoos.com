// B"H
import { localToWorld } from './HouseSpec.js';

export const HOUSE_GATE_WIDTH = 8.4;

/** Returns a closed fence path with a road-width opening aligned to the entry. */
export function createHouseFenceSegments(spec) {
	const padding = 5;
	const halfWidth = spec.width / 2 + padding;
	const halfDepth = spec.depth / 2 + padding;
	const gateWidth = Math.max(HOUSE_GATE_WIDTH, spec.doorW + 5.2);
	const backLeft = localToWorld(spec, -halfWidth, -halfDepth);
	const backRight = localToWorld(spec, halfWidth, -halfDepth);
	const frontRight = localToWorld(spec, halfWidth, halfDepth);
	const frontLeft = localToWorld(spec, -halfWidth, halfDepth);
	const gateLeft = localToWorld(spec, -gateWidth / 2, halfDepth);
	const gateRight = localToWorld(spec, gateWidth / 2, halfDepth);
	return [
		[backLeft, backRight],
		[backRight, frontRight],
		[frontRight, gateRight],
		[gateLeft, frontLeft],
		[frontLeft, backLeft]
	];
}
